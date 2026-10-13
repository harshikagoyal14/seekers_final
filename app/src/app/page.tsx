import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seekers · A closed community for Indian business owners",
  description: "Find trusted businesses, refer each other, share knowledge, meet at events. Every referral tracked end-to-end.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#083F43" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-white font-bold text-xl tracking-tight">Seekers<span style={{ color: "#0B5D63" }}>.</span></span>
        <Link
          href="/auth/sign-in"
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          Member sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-white font-bold text-4xl sm:text-5xl leading-tight mb-6" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
          Where trusted introductions<br />happen every day.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
          Seekers is a closed community of Indian business owners, freelancers, and investors. Find trusted businesses, refer each other, and every referral is tracked end-to-end.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/join"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: "#F6F7F5", color: "#083F43" }}
          >
            Request an invite
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/5 transition-colors"
          >
            Learn more
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 max-w-5xl mx-auto flex flex-wrap gap-4 text-xs text-white/40">
        <Link href="/about" className="hover:text-white/70 transition-colors">About Seekers</Link>
        <Link href="/wealth-seekers" className="hover:text-white/70 transition-colors">Wealth Seekers</Link>
        <Link href="/faq" className="hover:text-white/70 transition-colors">Help & FAQ</Link>
        <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
