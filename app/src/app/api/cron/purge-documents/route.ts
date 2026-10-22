import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/cron/purge-documents
// Deletes verification documents whose admin-set retention date has passed.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const now = new Date().toISOString();

  // Get documents past their retention date
  const { data: docs } = await db
    .from("verification_documents")
    .select("id, storage_path")
    .lt("retain_until", now)
    .is("deleted_at", null) as { data: Array<{ id: string; storage_path: string }> | null };

  if (!docs || docs.length === 0) {
    return NextResponse.json({ purged: 0 });
  }

  let purged = 0;
  for (const doc of docs) {
    // Delete from storage
    await svc.storage.from("verification-docs").remove([doc.storage_path]);
    // Mark deleted in DB
    await db.from("verification_documents").update({ deleted_at: now }).eq("id", doc.id);
    purged++;
  }

  console.log(`purge-documents: purged ${purged} documents`);
  return NextResponse.json({ purged });
}
