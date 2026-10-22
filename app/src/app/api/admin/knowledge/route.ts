import "server-only";
import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { emails, getEmailForProfile } from "@/lib/email";

export async function POST(request: Request) {
  await requireAdmin();
  const { id, action } = await request.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;
  const { error } = await db
    .from("knowledge_posts")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id) as { error: { message: string } | null };
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (action === "approve") {
    const { data: post } = await db
      .from("knowledge_posts")
      .select("title, author_id")
      .eq("id", id)
      .single() as { data: { title: string; author_id: string } | null };
    if (post) {
      getEmailForProfile(post.author_id).then(authorEmail => {
        if (authorEmail) emails.knowledgePostApproved(authorEmail, post.title);
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
