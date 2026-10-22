import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";

const ALLOWED_BUSINESS_FIELDS = [
  "name", "type", "category_id", "bio", "location", "years",
  "website", "instagram", "linkedin", "referral_fee_pct",
] as const;

// POST /api/business — create a new business listing
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: actor } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!actor) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Only one business listing per member
  const { data: existing } = await db
    .from("business_profiles")
    .select("id")
    .eq("owner_id", actor.id)
    .maybeSingle() as { data: { id: string } | null };
  if (existing) return NextResponse.json({ error: "You already have a business listing" }, { status: 409 });

  const body = await request.json();
  const { name, type, category_id, bio, location, years, referral_fee_pct } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Business type is required" }, { status: 400 });
  if (!category_id) return NextResponse.json({ error: "Category is required" }, { status: 400 });

  // Check regulated category — disallow referral fee
  const { data: cat } = await db
    .from("categories")
    .select("referral_fee_allowed")
    .eq("id", category_id)
    .single() as { data: { referral_fee_allowed: boolean } | null };

  const feeAllowed = cat?.referral_fee_allowed !== false;
  const fee = feeAllowed && referral_fee_pct ? Number(referral_fee_pct) : 0;

  const slug = generateSlug(name.trim());

  const { data: bp, error } = await db
    .from("business_profiles")
    .insert({
      owner_id: actor.id,
      name: name.trim(),
      slug,
      type,
      category_id,
      bio: bio?.trim() || null,
      location: location?.trim() || null,
      years: years ? Number(years) : null,
      referral_fee_pct: fee,
      approval_status: "pending",
    })
    .select("id, slug")
    .single() as { data: { id: string; slug: string } | null; error: { message: string } | null };

  if (error) {
    if (error.message?.includes("unique") || error.message?.includes("slug")) {
      // Slug collision — append random suffix
      const { data: bp2, error: err2 } = await db
        .from("business_profiles")
        .insert({
          owner_id: actor.id,
          name: name.trim(),
          slug: slug + "-" + Math.random().toString(36).slice(2, 6),
          type,
          category_id,
          bio: bio?.trim() || null,
          location: location?.trim() || null,
          years: years ? Number(years) : null,
          referral_fee_pct: fee,
          approval_status: "pending",
        })
        .select("id, slug")
        .single() as { data: { id: string; slug: string } | null; error: unknown };
      if (err2) return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
      return NextResponse.json({ id: bp2!.id, slug: bp2!.slug }, { status: 201 });
    }
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }

  return NextResponse.json({ id: bp!.id, slug: bp!.slug }, { status: 201 });
}

// PATCH /api/business — update own business listing
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: actor } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!actor) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: bp } = await db
    .from("business_profiles")
    .select("id, category_id")
    .eq("owner_id", actor.id)
    .single() as { data: { id: string; category_id: string } | null };
  if (!bp) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_BUSINESS_FIELDS) {
    if (key in body) updates[key] = body[key];
  }

  // If changing category, re-check regulated
  const catId = (updates.category_id as string | undefined) ?? bp.category_id;
  const { data: cat } = await db
    .from("categories")
    .select("referral_fee_allowed")
    .eq("id", catId)
    .single() as { data: { referral_fee_allowed: boolean } | null };
  if (cat?.referral_fee_allowed === false) {
    updates.referral_fee_pct = 0;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  // Any edit resets approval status to pending for admin review
  updates.approval_status = "pending";

  const { error } = await db
    .from("business_profiles")
    .update(updates)
    .eq("id", bp.id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
