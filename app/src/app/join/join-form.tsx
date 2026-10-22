"use client";
import { useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { searchParamsPromise: Promise<{ ref?: string; code?: string }> };

export default function JoinForm({ searchParamsPromise }: Props) {
  const searchParams = use(searchParamsPromise);
  const ownerCode   = searchParams.ref;   // Community Owner attribution
  const inviteCode  = searchParams.code;  // Member invite code

  const [email,   setEmail]   = useState("");
  const [over18,  setOver18]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!over18) { setError("You must be 18 or over to join."); return; }
    setLoading(true);
    setError("");

    // Store codes in cookie for callback to pick up
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", "/onboarding/profile");
    if (ownerCode)  redirectUrl.searchParams.set("owner", ownerCode);
    if (inviteCode) redirectUrl.searchParams.set("inv",   inviteCode);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl.toString(),
        data: { owner_code: ownerCode, invite_code: inviteCode },
      },
    });

    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <PublicShell>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-bold text-xl mb-2 text-[#15201E]">Check your email</h1>
          <p className="text-sm text-[#4F5B59]">
            We sent a sign-in link to <strong>{email}</strong>. Click it to complete your sign-up.
          </p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm">
        <h1 className="font-bold text-xl mb-1 text-[#15201E]">Join Seekers</h1>
        <p className="text-sm text-[#4F5B59] mb-6">
          {ownerCode
            ? "You were invited by a Community Owner."
            : inviteCode
            ? "You received a member invite."
            : "Membership is by invite only."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          {/* Honeypot — bots fill this, humans don't see it */}
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={over18}
              onChange={e => setOver18(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#D1D5D4] text-[#0B5D63] focus:ring-[#0B5D63]"
            />
            <span className="text-sm text-[#15201E]">
              I am 18 or over and agree to the{" "}
              <Link href="/privacy" className="text-[#0B5D63] underline">Privacy notice</Link>{" "}
              and{" "}
              <Link href="/terms" className="text-[#0B5D63] underline">Terms</Link>.
              My details will be shared with this business only.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Continue with email
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-[#4F5B59]">
          Already a member?{" "}
          <Link href="/auth/sign-in" className="font-medium text-[#0B5D63]">Sign in</Link>
        </p>
      </div>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#F6F7F5]">
      <Link href="/" className="mb-8">
        <span className="font-bold text-2xl text-[#083F43]">Seekers<span className="text-[#0B5D63]">.</span></span>
      </Link>
      {children}
    </div>
  );
}
