import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 5;
// In-memory rate limit (replace with Redis/KV in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_IP) return false;
  entry.count++;
  return true;
}

// Simple AES-GCM encryption stub — replace with real crypto once CONTACT_ENCRYPTION_KEY is set
async function encryptContact(contact: string): Promise<string> {
  if (!process.env.CONTACT_ENCRYPTION_KEY) return `[unencrypted]${contact}`;
  // Real implementation: AES-GCM with the key
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    Buffer.from(process.env.CONTACT_ENCRYPTION_KEY, "hex"),
    "AES-GCM",
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyMaterial, encoder.encode(contact));
  return Buffer.from(iv).toString("hex") + ":" + Buffer.from(encrypted).toString("hex");
}

export async function POST(request: Request) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many enquiries. Please wait before sending another." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { business_id, name, contact, message } = body;

  // Honeypot check
  if (body.website) return NextResponse.json({ error: "Bot detected" }, { status: 400 });

  if (!business_id || !name?.trim() || !contact?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Verify business is approved
  const { data: business } = await db
    .from("business_profiles")
    .select("id, owner_id")
    .eq("id", business_id)
    .eq("approval_status", "approved")
    .single() as { data: { id: string; owner_id: string } | null };

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const contactEncrypted = await encryptContact(contact.trim());

  // Check if sender is a signed-in member
  const { data: { user } } = await (await import("@/lib/supabase/server")).createClient().then(c => c.auth.getUser().then(r => ({ data: r.data })));
  let sender_profile_id: string | null = null;
  if (user) {
    const { data: p } = await db.from("profiles").select("id").eq("user_id", user.id).single() as { data: { id: string } | null };
    if (p) sender_profile_id = p.id;
  }

  const { error } = await db.from("enquiries").insert({
    business_id,
    sender_profile_id,
    name: name.trim(),
    contact_encrypted: contactEncrypted,
    message: message.trim(),
  }) as { error: { message: string } | null };

  if (error) {
    console.error("Enquiry insert error:", error);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }

  // TODO: trigger email to business owner

  return NextResponse.json({ ok: true }, { status: 201 });
}
