"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");
  const router                  = useSearchParams();
  const nextPath                = router.get("next") ?? "/home";
  const supabase                = createClient();
  const appRouter               = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextPath}` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F6F7F5" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <span className="font-bold text-2xl" style={{ color: "#083F43" }}>Seekers<span style={{ color: "#0B5D63" }}>.</span></span>
        </Link>

        {sent ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="font-bold text-xl mb-2" style={{ color: "#15201E" }}>Check your email</h1>
            <p className="text-sm" style={{ color: "#4F5B59" }}>
              We sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="font-bold text-xl mb-1" style={{ color: "#15201E" }}>Sign in</h1>
            <p className="text-sm mb-6" style={{ color: "#4F5B59" }}>We'll send you a one-time link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#15201E" }} htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl border px-4 text-base focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5D4", color: "#15201E", background: "#fff", "--tw-ring-color": "#0B5D63" } as React.CSSProperties}
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
                style={{ background: "#0B5D63", color: "#fff" }}
              >
                {loading ? "Sending…" : "Send sign-in link"}
              </button>
            </form>

            <p className="mt-6 text-xs text-center" style={{ color: "#4F5B59" }}>
              Don't have an account?{" "}
              <Link href="/join" className="font-medium" style={{ color: "#0B5D63" }}>
                Request an invite
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
