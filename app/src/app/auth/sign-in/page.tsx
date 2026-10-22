"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const params                = useSearchParams();
  const nextPath              = params.get("next") ?? "/home";
  const supabase              = createClient();
  const router                = useRouter();

  void router;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextPath}` },
    });
    if (error) { setError(error.message); } else { setSent(true); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--canvas)" }}>
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 page-header">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>S</div>
          <span className="font-bold text-xl text-white tracking-tight">Seekers</span>
        </div>
        <div>
          <blockquote className="text-white text-2xl font-semibold leading-snug mb-4">
            "A community built on trust, not reach."
          </blockquote>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14 }}>
            Closed-door. Referral-powered. For Indian business owners who mean business.
          </p>
        </div>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>© {new Date().getFullYear()} Seekers</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg,#083F43,#0B5D63)" }}>S</div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "#083F43" }}>Seekers</span>
        </Link>

        <div className="w-full max-w-sm">
          {sent ? (
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: "#E3F2E8" }}>📬</div>
              <h1 className="font-bold text-xl mb-2" style={{ color: "var(--ink)" }}>Check your inbox</h1>
              <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                We sent a sign-in link to <strong>{email}</strong>. Click it to continue.
              </p>
              <button onClick={() => setSent(false)} className="mt-5 text-xs" style={{ color: "var(--brand)" }}>
                Use a different email
              </button>
            </div>
          ) : (
            <div className="card p-8">
              <h1 className="font-bold text-2xl mb-1" style={{ color: "var(--ink)" }}>Welcome back</h1>
              <p className="text-sm mb-7" style={{ color: "var(--ink-2)" }}>
                Enter your email and we'll send you a sign-in link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }} htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 rounded-xl border px-4 text-base transition-shadow focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--ink)",
                      background: "#fff",
                    }}
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="rounded-xl p-3 text-sm" style={{ background: "#FBE9E6", color: "#A52A1C" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#083F43,#0B5D63)" }}
                >
                  {loading ? "Sending…" : "Send sign-in link →"}
                </button>
              </form>

              <p className="mt-6 text-xs text-center" style={{ color: "var(--ink-2)" }}>
                No account?{" "}
                <Link href="/join" className="font-semibold" style={{ color: "var(--brand)" }}>
                  Request an invite
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
