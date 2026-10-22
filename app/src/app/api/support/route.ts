import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let message: string;
  let email: string | undefined;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    message = body.message;
    email = body.email;
  } else {
    const form = await request.formData();
    message = form.get("message") as string;
    email = form.get("email") as string | undefined;
  }

  if (!message?.trim()) {
    return NextResponse.redirect(new URL("/faq?error=empty", request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  let profile_id: string | null = null;
  if (user) {
    const { data: p } = await db.from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
    if (p) profile_id = p.id;
  }

  await db.from("support_tickets").insert({
    profile_id,
    email: email?.trim() || null,
    message: message.trim(),
  });

  // If form submission, redirect back
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/faq?sent=1", request.url));
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
