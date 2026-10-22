import type { Metadata } from "next";
import Link from "next/link";
import WealthSeekersForm from "./wealth-seekers-form";

export const metadata: Metadata = {
  title: "Wealth Seekers — Seekers Community",
  description: "An exclusive circle within Seekers for investors, angels, and wealth managers.",
};

const BENEFITS = [
  "Access to vetted deal flow from Seekers members — founders, project owners, operators",
  "A private directory of co-investors in the community",
  "Compliance guardrails built in — categories that require SEBI registration are gated",
  "No unsolicited promotions — every introduction is opt-in",
];

export default function WealthSeekersPage() {
  return (
    <div className="min-h-screen bg-[#083F43] text-white">
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="font-bold text-lg">Seekers<span className="text-[#4BB8BF]">.</span></Link>
        <Link href="/auth/sign-in" className="text-sm text-white/70">Member sign in</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-xs font-medium mb-6 text-white/70">
            By invitation only
          </div>
          <h1 className="font-bold text-4xl leading-tight mb-4">Wealth Seekers</h1>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            An exclusive circle within Seekers for verified angels, HNIs, family offices and wealth managers. Compliant introductions. No cold pitches.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-base mb-4">What you get</h2>
          <ul className="space-y-3 text-sm text-white/80">
            {BENEFITS.map(item => (
              <li key={item} className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="7" fill="#4BB8BF" />
                  <path d="M5 8l2 2 4-4" stroke="#083F43" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-900/40 rounded-xl px-4 py-3 text-xs text-amber-200 mb-8">
          <strong>Regulatory notice:</strong> Investment advisory services on this platform require SEBI registration. Seekers does not facilitate regulated financial advice. Wealth Seekers is a member networking layer only.
        </div>

        <WealthSeekersForm />
      </main>
    </div>
  );
}
