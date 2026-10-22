import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/cron/expire-referrals
// Called by Vercel Cron daily. Moves stale INITIATED referrals (>30 days) to EXPIRED.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error } = await db
    .from("referrals")
    .update({ status: "EXPIRED" })
    .eq("status", "INITIATED")
    .lt("created_at", cutoff)
    .select("id") as { data: Array<{ id: string }> | null; error: unknown };

  if (error) {
    console.error("expire-referrals cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const count = (expired ?? []).length;
  console.log(`expire-referrals: expired ${count} referrals`);
  return NextResponse.json({ expired: count });
}
