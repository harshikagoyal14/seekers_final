import "server-only";
import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireAdmin();
  const contentType = request.headers.get("content-type") ?? "";
  let id: string, action: string;
  if (contentType.includes("application/json")) {
    const body = await request.json();
    id = body.id; action = body.action;
  } else {
    const form = await request.formData();
    id = form.get("id") as string;
    action = form.get("action") as string;
  }
  if (!id || !["approve","reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc as any)
    .from("reviews")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!contentType.includes("application/json")) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/reviews");
  }
  return NextResponse.json({ ok: true });
}
