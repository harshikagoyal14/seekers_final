import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code      = searchParams.get("code");
  const next      = searchParams.get("next") ?? "/home";
  const ownerCode = searchParams.get("owner");
  const invCode   = searchParams.get("inv");

  if (!code) return NextResponse.redirect(`${origin}/auth/sign-in?error=missing_code`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`);

  // Check if profile already exists
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/auth/sign-in?error=no_user`);

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    // New user — store attribution codes in session metadata for onboarding to read
    // We encode them in the redirect URL; onboarding API route writes them to the DB
    const onboardUrl = new URL(`${origin}/onboarding/profile`);
    if (ownerCode) onboardUrl.searchParams.set("owner", ownerCode);
    if (invCode)   onboardUrl.searchParams.set("inv",   invCode);
    return NextResponse.redirect(onboardUrl.toString());
  }

  return NextResponse.redirect(`${origin}${next}`);
}
