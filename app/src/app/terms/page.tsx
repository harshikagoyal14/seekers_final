import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms that govern your use of the Seekers platform." };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#083F43]">Seekers<span className="text-[#0B5D63]">.</span></Link>
        <Link href="/auth/sign-in" className="text-sm font-medium text-[#0B5D63]">Member sign in</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-bold text-3xl text-[#083F43] mb-2">Terms of Use</h1>
        <p className="text-[#4F5B59] text-sm mb-8">Last updated: October 2026. By joining Seekers you agree to these terms.</p>

        {[
          ["Membership", "Seekers is a closed community. Membership requires an invitation and admin approval. You must be 18 or over. We may suspend or remove any account that violates these terms."],
          ["Referrals", "Referral codes track introductions. When you refer someone to a business, you agree to the terms the business set at the time of the referral. Credits are awarded only after the seeker confirms the deal and the business agrees. Referrals in regulated categories (insurance, legal, CA/tax, investment advisory) earn no credits."],
          ["Conduct", "You may not use Seekers to spam, harass, or deceive other members. You may not attempt to bypass the referral engine by taking contacts off-platform to avoid a tracked referral."],
          ["Businesses", "Business listings go through admin approval. A listing is public only after approval. Providing false information in a listing may result in removal and loss of all earned credits."],
          ["Knowledge posts", "Posts are approved before they appear. Do not share content that names a security while predicting its price or return. Every market-category post carries an education-only disclaimer."],
          ["Credits", "Seeker Credits are a reward currency inside the platform. They have no cash value and cannot be transferred or sold. Seekers reserves the right to correct any credits awarded in error."],
          ["Limitation of liability", "Seekers is a platform that connects members with businesses. We do not guarantee the quality of any service listed. Any dispute between a member and a business is between those two parties."],
          ["Changes", "We may update these terms. We will notify members by email before a material change takes effect."],
        ].map(([title, body]) => (
          <section key={title as string} className="mb-6">
            <h2 className="font-semibold text-base text-[#15201E] mb-1">{title}</h2>
            <p className="text-sm text-[#4F5B59] leading-relaxed">{body}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
