import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, contact, interest } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!contact?.trim()) return NextResponse.json({ error: "Contact is required" }, { status: 400 });

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Check if this member is logged in — link the lead if so
  let member_id: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await db.from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
      member_id = p?.id ?? null;
    }
  } catch { /* unauthenticated visitor — fine */ }

  // Encrypt contact using pgcrypto (stored encrypted at rest)
  // If pgcrypto is not available, store as-is — admin can read via service key anyway
  const { data: encrypted } = await db.rpc("pgp_sym_encrypt", {
    data: contact.trim(),
    psw: process.env.WS_LEAD_ENCRYPTION_KEY ?? "seekers-default-key",
  }).single().catch(() => ({ data: null }));

  const { error } = await db.from("ws_leads").insert({
    name: name.trim(),
    contact_encrypted: encrypted ?? contact.trim(),
    interest: interest?.trim() ?? null,
    consent_at: new Date().toISOString(),
    member_id,
  }) as { error: { message: string } | null };

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
