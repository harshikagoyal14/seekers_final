import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  let event_id: string;
  if (contentType.includes("application/json")) {
    const body = await request.json();
    event_id = body.event_id;
  } else {
    const form = await request.formData();
    event_id = form.get("event_id") as string;
  }
  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { error } = await db
    .from("event_rsvps")
    .upsert({ event_id, profile_id: profile.id, status: "going" }, { onConflict: "event_id,profile_id" }) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!contentType.includes("application/json")) {
    const { redirect } = await import("next/navigation");
    redirect("/community/events");
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  await db.from("event_rsvps").delete().eq("event_id", event_id).eq("profile_id", profile.id);

  return NextResponse.json({ ok: true });
}
