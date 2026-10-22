import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/referrals/[id]/confirm — seeker confirms deal closed (moves to CLOSED_WON)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: profile } = await db
    .from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: referral } = await db
    .from("referrals")
    .select("id, state, seeker_id, referrer_id, business_profiles(referral_fee_pct)")
    .eq("id", id)
    .single() as {
      data: {
        id: string; state: string; seeker_id: string | null; referrer_id: string;
        business_profiles: { referral_fee_pct: number } | null;
      } | null;
    };

  if (!referral) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the seeker or the referrer can confirm
  const isSeeker = referral.seeker_id === profile.id;
  const isReferrer = referral.referrer_id === profile.id;
  if (!isSeeker && !isReferrer) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (!["IN_PROGRESS", "CONTACTED", "ACCEPTED"].includes(referral.state)) {
    return NextResponse.json({ error: "Referral cannot be confirmed in current state" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const deal_value_paise = body.deal_value_paise ?? null;
  const feePct = referral.business_profiles?.referral_fee_pct ?? 0;
  const credits = deal_value_paise && feePct > 0
    ? Math.round(deal_value_paise * feePct / 100)
    : null;

  const { error } = await db
    .from("referrals")
    .update({
      state: "CLOSED_WON",
      deal_value_paise: deal_value_paise ?? null,
      credits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to confirm" }, { status: 500 });
  return NextResponse.json({ ok: true, credits });
}
