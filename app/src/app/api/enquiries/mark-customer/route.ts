import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let id: string;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    id = body.id;
  } else {
    const form = await request.formData();
    id = form.get("id") as string;
  }

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

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
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify the enquiry belongs to a business owned by this user
  const { data: enquiry } = await db
    .from("enquiries")
    .select("id, business_id, business_profiles(owner_id)")
    .eq("id", id)
    .single() as { data: { id: string; business_id: string; business_profiles: { owner_id: string } | null } | null };

  if (!enquiry || enquiry.business_profiles?.owner_id !== profile.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await db
    .from("enquiries")
    .update({ became_customer: true, status: "became_customer" })
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });

  if (!contentType.includes("application/json")) {
    const { redirect } = await import("next/navigation");
    redirect("/my-business/enquiries");
  }

  return NextResponse.json({ ok: true });
}
