import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/cron/settle-credits
// 1. Awards credit_transactions for CLOSED_WON referrals that have a deal_value_paise
//    and a referral_fee_pct, but no existing credit_transaction yet.
// 2. Marks pending credit_transactions whose settles_at has passed as 'settled'.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // ── Step 1: Award credits for won referrals not yet credited ──────────────
  const { data: uncredited } = await db
    .from("referrals")
    .select("id, referrer_id, deal_value_paise, business_profiles(referral_fee_pct)")
    .eq("state", "CLOSED_WON")
    .not("deal_value_paise", "is", null)
    .not("referrer_id", "is", null) as {
      data: {
        id: string;
        referrer_id: string;
        deal_value_paise: number;
        business_profiles: { referral_fee_pct: number } | null;
      }[] | null
    };

  // Filter out ones that already have a credit_transaction
  const refIds = (uncredited ?? []).map(r => r.id);
  let alreadyCredited = new Set<string>();
  if (refIds.length > 0) {
    const { data: existing } = await db
      .from("credit_transactions")
      .select("referral_id")
      .in("referral_id", refIds) as { data: { referral_id: string }[] | null };
    alreadyCredited = new Set((existing ?? []).map(e => e.referral_id));
  }

  const toCredit = (uncredited ?? []).filter(r => {
    if (alreadyCredited.has(r.id)) return false;
    const fee = r.business_profiles?.referral_fee_pct ?? 0;
    return fee > 0 && r.deal_value_paise > 0;
  });

  let awarded = 0;
  for (const r of toCredit) {
    const feePct = r.business_profiles!.referral_fee_pct;
    const creditAmount = Math.floor(r.deal_value_paise * feePct / 100);
    if (creditAmount <= 0) continue;

    // Settles 30 days from now
    const settles_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await db.from("credit_transactions").insert({
      member_id: r.referrer_id,
      referral_id: r.id,
      amount: creditAmount,
      type: "CREDIT",
      status: "pending",
      settles_at,
      note: `${feePct}% of ₹${(r.deal_value_paise / 100).toLocaleString("en-IN")} deal`,
    }) as { error: unknown };

    if (!error) awarded++;
  }

  // ── Step 2: Mark due pending credits as settled ───────────────────────────
  const now = new Date().toISOString();
  const { data: settled, error: settleErr } = await db
    .from("credit_transactions")
    .update({ status: "settled", settled_at: now })
    .eq("status", "pending")
    .lte("settles_at", now)
    .select("id") as { data: { id: string }[] | null; error: unknown };

  if (settleErr) console.error("settle-credits step 2 error:", settleErr);

  const settledCount = (settled ?? []).length;
  console.log(`settle-credits: awarded ${awarded}, settled ${settledCount}`);
  return NextResponse.json({ awarded, settled: settledCount });
}
