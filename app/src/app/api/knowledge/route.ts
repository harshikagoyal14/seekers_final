import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_CATEGORIES = ["Markets", "Tax & Legal", "Running a Business", "Finance", "Technology", "Other"];

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
  const { url, title, description, category } = body;

  if (!url?.trim()) return NextResponse.json({ error: "URL is required" }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!ALLOWED_CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  // Basic URL validation
  try { new URL(url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { error } = await db
    .from("knowledge_posts")
    .insert({
      url: url.trim(),
      title: title.trim(),
      description: description?.trim() || null,
      category,
      source: "member",
      author_id: profile.id,
      status: "pending",
    }) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: "Failed to submit" }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
