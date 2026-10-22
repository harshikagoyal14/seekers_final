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

  const { data: biz } = await db
    .from("business_profiles")
    .select("id")
    .eq("owner_id", profile.id)
    .maybeSingle() as { data: { id: string } | null };
  if (!biz) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp"];
  if (!allowed.includes(ext)) return NextResponse.json({ error: "Image files only" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 });

  const path = `logos/${biz.id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await svc.storage
    .from("media")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = svc.storage.from("media").getPublicUrl(path);

  await db.from("business_profiles").update({ logo_path: publicUrl }).eq("id", biz.id);

  return NextResponse.json({ url: publicUrl });
}
