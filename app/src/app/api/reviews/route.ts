import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  const { referral_id, rating, text } = body;

  if (!referral_id) return NextResponse.json({ error: "referral_id required" }, { status: 400 });
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "rating 1–5 required" }, { status: 400 });
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.trim().length > 200) return NextResponse.json({ error: "Max 200 characters" }, { status: 400 });

  // Verify the referral belongs to this member and is CLOSED_WON
  const { data: referral } = await db
    .from("referrals")
    .select("id, state, business_id, referrer_id")
    .eq("id", referral_id)
    .single() as { data: { id: string; state: string; business_id: string; referrer_id: string } | null };

  if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  if (referral.referrer_id !== profile.id) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  if (referral.state !== "CLOSED_WON") return NextResponse.json({ error: "Can only review a won referral" }, { status: 400 });

  // Check no duplicate review for this referral
  const { data: existing } = await db
    .from("reviews")
    .select("id")
    .eq("referral_id", referral_id)
    .maybeSingle() as { data: { id: string } | null };
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const { error } = await db
    .from("reviews")
    .insert({
      type: "verified",
      business_id: referral.business_id,
      author_profile_id: profile.id,
      referral_id,
      rating,
      text: text.trim(),
      status: "pending",
    }) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
