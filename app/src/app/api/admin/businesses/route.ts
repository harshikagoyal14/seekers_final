import "server-only";
import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { emails, getEmailForProfile } from "@/lib/email";

export async function POST(request: Request) {
  await requireAdmin();
  const { id, action } = await request.json();

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const status = action === "approve" ? "approved" : "rejected";
  const updates: Record<string, unknown> = { approval_status: status };
  if (action === "approve") updates.approved_at = new Date().toISOString();

  const { error } = await db
    .from("business_profiles")
    .update(updates)
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (action === "approve") {
    const { data: biz } = await db
      .from("business_profiles")
      .select("name, owner_id")
      .eq("id", id)
      .single() as { data: { name: string; owner_id: string } | null };
    if (biz) {
      getEmailForProfile(biz.owner_id).then(ownerEmail => {
        if (ownerEmail) emails.businessApproved(ownerEmail, biz.name);
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
