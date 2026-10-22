import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { emails, getEmailForProfile } from "@/lib/email";

const VALID_TRANSITIONS: Record<string, string[]> = {
  INITIATED:   ["ACCEPTED", "CLOSED_LOST"],
  ACCEPTED:    ["CONTACTED", "CLOSED_LOST"],
  CONTACTED:   ["IN_PROGRESS", "CLOSED_LOST"],
  IN_PROGRESS: ["CLOSED_WON", "CLOSED_LOST"],
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let id: string, state: string;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    id = body.id; state = body.state;
  } else {
    const form = await request.formData();
    id = form.get("id") as string;
    state = form.get("state") as string;
  }

  if (!id || !state) return NextResponse.json({ error: "id and state required" }, { status: 400 });

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

  // Get referral and verify the business belongs to this user
  const { data: referral } = await db
    .from("referrals")
    .select("id, state, business_id, business_profiles(owner_id)")
    .eq("id", id)
    .single() as { data: { id: string; state: string; business_id: string; business_profiles: { owner_id: string } | null } | null };

  if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  if (referral.business_profiles?.owner_id !== profile.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const allowed = VALID_TRANSITIONS[referral.state] ?? [];
  if (!allowed.includes(state)) {
    return NextResponse.json({ error: `Cannot transition from ${referral.state} to ${state}` }, { status: 400 });
  }

  const { error } = await db
    .from("referrals")
    .update({ state, updated_at: new Date().toISOString() })
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

  // Notify the referrer of the status change (fire-and-forget)
  const { data: fullRef } = await db
    .from("referrals")
    .select("referrer_id, business_profiles(name)")
    .eq("id", id)
    .single() as { data: { referrer_id: string; business_profiles: { name: string } | null } | null };
  if (fullRef) {
    getEmailForProfile(fullRef.referrer_id).then(referrerEmail => {
      if (referrerEmail) emails.referralStatusChanged(referrerEmail, fullRef.business_profiles?.name ?? "a business", state);
    }).catch(() => {});
  }

  // For form submissions, redirect back
  if (!contentType.includes("application/json")) {
    const { redirect } = await import("next/navigation");
    redirect("/my-business/referrals");
  }

  return NextResponse.json({ ok: true });
}
