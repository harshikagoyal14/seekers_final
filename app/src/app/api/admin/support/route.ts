import "server-only";
import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireAdmin();
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

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc as any).from("support_tickets").update({ status: "resolved" }).eq("id", id) as { error: { message: string } | null };
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!contentType.includes("application/json")) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/support");
  }
  return NextResponse.json({ ok: true });
}
