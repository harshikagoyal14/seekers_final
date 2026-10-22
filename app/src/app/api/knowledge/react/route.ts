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
    .from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { post_id, type } = await request.json();
  if (!post_id || !["helpful", "save"].includes(type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Toggle: if exists delete, else insert
  const { data: existing } = await db
    .from("knowledge_reactions")
    .select("post_id")
    .eq("post_id", post_id)
    .eq("profile_id", profile.id)
    .eq("type", type)
    .maybeSingle() as { data: { post_id: string } | null };

  if (existing) {
    await db.from("knowledge_reactions").delete()
      .eq("post_id", post_id).eq("profile_id", profile.id).eq("type", type);
    return NextResponse.json({ action: "removed" });
  } else {
    await db.from("knowledge_reactions").insert({ post_id, profile_id: profile.id, type });
    return NextResponse.json({ action: "added" });
  }
}
