import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";

// POST /api/profile — create profile for new user (called from onboarding step 1)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anonDb = supabase as any;
  // Check profile doesn't already exist
  const { data: existing } = await anonDb.from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
  if (existing) return NextResponse.json({ error: "Profile already exists" }, { status: 409 });

  const body = await request.json();
  const { name, bio, company, designation, industry, location, owner_code, invite_code: invCode } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // Use service client to resolve attribution — owner code and invite code
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svcDb = svc as any;
  let attributed_owner_id: string | null = null;
  let invited_by: string | null = null;

  if (owner_code) {
    const { data: owner } = await svcDb
      .from("community_owners")
      .select("profile_id")
      .eq("code", owner_code)
      .eq("status", "active")
      .single() as { data: { profile_id: string } | null };
    if (owner) attributed_owner_id = owner.profile_id;
  }

  if (invCode && !owner_code) {
    const { data: inviter } = await svcDb
      .from("profiles")
      .select("id")
      .eq("invite_code", invCode)
      .single() as { data: { id: string } | null };
    if (inviter) invited_by = inviter.id;
  }

  // Generate unique invite code for this new member
  const myInviteCode = "INV-" + generateSlug(name).toUpperCase().slice(0, 8) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

  const { data: profile, error } = await svcDb
    .from("profiles")
    .insert({
      user_id: user.id,
      name: name.trim(),
      bio: bio?.trim() || null,
      company: company?.trim() || null,
      designation: designation?.trim() || null,
      industry: industry || null,
      location: location?.trim() || null,
      attributed_owner_id,
      invited_by,
      invite_code: myInviteCode,
      grandfathered: true,  // set while platform is in free mode
    })
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (error) {
    console.error("Profile create error:", error);
    return NextResponse.json({ error: (error as { message?: string }).message ?? "Failed to create profile" }, { status: 500 });
  }

  // Track invite event
  if (invited_by) {
    await svcDb.from("invite_events").insert({ inviter_id: invited_by, type: "joined" });
  }

  // Seed onboarding progress
  await svcDb.from("onboarding_progress").insert({ profile_id: profile!.id, step: "profile" });

  return NextResponse.json({ id: profile!.id }, { status: 201 });
}

// PATCH /api/profile — update own profile fields
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await request.json();

  // Allow-list of fields a member can update on their own profile
  const ALLOWED = ["name","bio","company","designation","industry","location","directory_visible","leaderboard_opt_in","spotlight_opt_in","photo_url"] as const;
  type Allowed = typeof ALLOWED[number];
  const updates: Partial<Record<Allowed, unknown>> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await db.from("profiles").update(updates).eq("id", profile.id) as { error: { message: string } | null };
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
