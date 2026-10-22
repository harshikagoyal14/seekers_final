import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ReferralsClient from "./referrals-client";

export const metadata: Metadata = { title: "Referrals" };

type BizOption = { id: string; name: string; slug: string; referral_fee_pct: number };

export type ReferralRow = {
  id: string;
  code: string;
  type: string;
  state: string;
  deal_value_paise: number | null;
  credits: number | null;
  created_at: string;
  note: string | null;
  business_profiles: { id: string; name: string; slug: string } | null;
};

export default async function ReferralsPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Approved businesses (excluding own)
  const { data: businesses } = await db
    .from("business_profiles")
    .select("id, name, slug, referral_fee_pct")
    .eq("approval_status", "approved")
    .neq("owner_id", actor.id)
    .order("name") as { data: BizOption[] | null };

  // Existing referrals by this member
  const { data: referrals } = await db
    .from("referrals")
    .select(`
      id, code, type, state, deal_value_paise, credits, created_at,
      note,
      business_profiles(id, name, slug)
    `)
    .eq("referrer_id", actor.id)
    .order("created_at", { ascending: false })
    .limit(50) as { data: ReferralRow[] | null };

  // IDs of referrals already reviewed
  const wonIds = (referrals ?? []).filter(r => r.state === "CLOSED_WON").map(r => r.id);
  let reviewedIds: Set<string> = new Set();
  if (wonIds.length > 0) {
    const { data: reviews } = await db
      .from("reviews")
      .select("referral_id")
      .in("referral_id", wonIds) as { data: { referral_id: string }[] | null };
    reviewedIds = new Set((reviews ?? []).map(r => r.referral_id));
  }

  return (
    <ReferralsClient
      businesses={businesses ?? []}
      referrals={referrals ?? []}
      reviewedIds={[...reviewedIds]}
    />
  );
}
