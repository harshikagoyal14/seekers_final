import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { emails, getEmailForProfile } from "@/lib/email";

// GET /api/referrals — list the current user's referrals (as referrer)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: referrals, error } = await db
    .from("referrals")
    .select(`
      id, code, type, state, deal_value_paise, credits, created_at, updated_at,
      business_profiles(id, name, slug),
      seeker:profiles!referrals_seeker_id_fkey(id, name)
    `)
    .eq("referrer_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50) as { data: unknown[] | null; error: unknown };

  if (error) return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 });

  return NextResponse.json({ referrals: referrals ?? [] });
}

// POST /api/referrals — create a new referral
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await request.json();
  const { business_id, seeker_name, seeker_contact, note } = body;

  if (!business_id) return NextResponse.json({ error: "business_id is required" }, { status: 400 });
  if (!seeker_name?.trim()) return NextResponse.json({ error: "seeker_name is required" }, { status: 400 });
  if (!seeker_contact?.trim()) return NextResponse.json({ error: "seeker_contact is required" }, { status: 400 });

  // Verify business exists and is approved
  const { data: biz } = await db
    .from("business_profiles")
    .select("id, name, owner_id, referral_fee_pct")
    .eq("id", business_id)
    .eq("approval_status", "approved")
    .single() as { data: { id: string; name: string; owner_id: string; referral_fee_pct: number } | null };
  if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  // Can't self-refer your own business
  if (biz.owner_id === profile.id) {
    return NextResponse.json({ error: "You cannot refer to your own business" }, { status: 400 });
  }

  // Generate referral code
  const code = "REF-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  // Compose note with seeker contact since seeker may not have an account
  const fullNote = [
    `Seeker: ${seeker_name.trim()} (${seeker_contact.trim()})`,
    note?.trim(),
  ].filter(Boolean).join("\n");

  const { data: ref, error } = await db
    .from("referrals")
    .insert({
      code,
      type: "third_party",
      referrer_id: profile.id,
      business_id: biz.id,
      seeker_id: null,
      note: fullNote,
      state: "INITIATED",
    })
    .select("id, code")
    .single() as { data: { id: string; code: string } | null; error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });

  // Email the business owner (fire-and-forget)
  const { data: referrerProfile } = await db
    .from("profiles")
    .select("name")
    .eq("id", profile.id)
    .single() as { data: { name: string } | null };
  getEmailForProfile(biz.owner_id).then(ownerEmail => {
    if (ownerEmail) emails.referralReceived(ownerEmail, biz.name, referrerProfile?.name ?? "A member");
  }).catch(() => {});

  return NextResponse.json({ id: ref!.id, code: ref!.code }, { status: 201 });
}
