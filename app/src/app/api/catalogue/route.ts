import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getActorBusiness(db: unknown, userId: string, businessId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = db as any;
  const { data: profile } = await d.from("profiles").select("id").eq("user_id", userId).single() as { data: { id: string } | null };
  if (!profile) return null;

  const bizQuery = d.from("business_profiles").select("id").eq("owner_id", profile.id);
  const { data: biz } = businessId
    ? await bizQuery.eq("id", businessId).single()
    : await bizQuery.single() as { data: { id: string } | null };
  return biz as { id: string } | null;
}

// GET /api/catalogue?business_id=... — list items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: items } = await db
    .from("catalogue_items")
    .select("id, title, description, price_paise, price_label, position, hidden")
    .eq("business_id", businessId)
    .order("position") as { data: unknown[] | null };

  return NextResponse.json({ items: items ?? [] });
}

// POST /api/catalogue — create item
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  const body = await request.json();
  const { business_id, title, description, price_paise, price_label } = body;

  const biz = await getActorBusiness(svc, user.id, business_id);
  if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Get next position
  const { data: last } = await db
    .from("catalogue_items")
    .select("position")
    .eq("business_id", biz.id)
    .order("position", { ascending: false })
    .limit(1)
    .single() as { data: { position: number } | null };
  const position = (last?.position ?? 0) + 1;

  const { error } = await db.from("catalogue_items").insert({
    business_id: biz.id,
    title: title.trim(),
    description: description?.trim() || null,
    price_paise: price_paise ?? null,
    price_label: price_label?.trim() || null,
    position,
    hidden: false,
  }) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// PATCH /api/catalogue — update item
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  const body = await request.json();
  const { id, business_id, title, description, price_paise, price_label, hidden } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const biz = await getActorBusiness(svc, user.id, business_id);
  if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (price_paise !== undefined) updates.price_paise = price_paise ?? null;
  if (price_label !== undefined) updates.price_label = price_label?.trim() || null;
  if (hidden !== undefined) updates.hidden = hidden;

  const { error } = await db
    .from("catalogue_items")
    .update(updates)
    .eq("id", id)
    .eq("business_id", biz.id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/catalogue — delete item
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await createServiceClient();
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const biz = await getActorBusiness(svc, user.id);
  if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;
  const { error } = await db
    .from("catalogue_items")
    .delete()
    .eq("id", id)
    .eq("business_id", biz.id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
