import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/referrals/[id]/dispute — flag a referral as disputed
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
    .select("id, state, seeker_id, referrer_id, business_profiles(owner_id)")
    .eq("id", id)
    .single() as {
      data: {
        id: string; state: string; seeker_id: string | null; referrer_id: string;
        business_profiles: { owner_id: string } | null;
      } | null;
    };

  if (!referral) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParty =
    referral.seeker_id === profile.id ||
    referral.referrer_id === profile.id ||
    referral.business_profiles?.owner_id === profile.id;

  if (!isParty) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const reason = body.reason?.trim() || null;

  const { error } = await db
    .from("referrals")
    .update({
      state: "DISPUTED",
      note: reason ? `[DISPUTE] ${reason}` : "[DISPUTE]",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to dispute" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
