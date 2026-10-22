import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About Seekers",
  description: "Seekers is a closed community of trusted Indian business owners, freelancers and investors.",
};

export default async function AboutPage() {
  const svc = await createServiceClient();

  // Live stats — shown only once past admin-set thresholds
  const THRESHOLDS = { members: 50, businesses: 10, events: 3 };
  const [{ count: memberCount }, { count: bizCount }] = await Promise.all([
    svc.from("profiles").select("id", { count: "exact", head: true }),
    svc.from("business_profiles").select("id", { count: "exact", head: true }).eq("approval_status", "approved"),
  ]);

  const showMembers   = (memberCount   ?? 0) >= THRESHOLDS.members;
  const showBusinesses = (bizCount     ?? 0) >= THRESHOLDS.businesses;

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#083F43]">Seekers<span className="text-[#0B5D63]">.</span></Link>
        <Link href="/auth/sign-in" className="text-sm font-medium text-[#0B5D63]">Member sign in</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-bold text-4xl text-[#083F43] mb-6">About Seekers</h1>
        <p className="text-lg text-[#15201E] leading-relaxed mb-6">
          Seekers is the web home for a closed community of Indian business owners, freelancers, and stock-market and investing people.
        </p>
        <p className="text-base text-[#4F5B59] leading-relaxed mb-6">
          Members find trusted businesses, refer each other, share knowledge and meet at events. Every referral is tracked end to end, so the person who made the introduction gets the credit and the business knows where the lead came from.
        </p>

        {/* Live stats */}
        {(showMembers || showBusinesses) && (
          <div className="flex gap-6 mb-8">
            {showMembers && (
              <div>
                <p className="font-bold text-3xl text-[#0B5D63]">{memberCount?.toLocaleString("en-IN")}+</p>
                <p className="text-sm text-[#4F5B59]">Members</p>
              </div>
            )}
            {showBusinesses && (
              <div>
                <p className="font-bold text-3xl text-[#0B5D63]">{bizCount?.toLocaleString("en-IN")}+</p>
                <p className="text-sm text-[#4F5B59]">Verified businesses</p>
              </div>
            )}
          </div>
        )}

        <h2 className="font-bold text-xl text-[#15201E] mb-3">What Seekers stands for</h2>
        <ul className="space-y-3 mb-8">
          {VALUES.map(v => (
            <li key={v.title} className="flex gap-3">
              <span className="text-[#0B5D63] font-bold mt-0.5">→</span>
              <div>
                <p className="font-semibold text-[#15201E]">{v.title}</p>
                <p className="text-sm text-[#4F5B59]">{v.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-4">
          <Link href="/join" className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold text-sm text-white bg-[#0B5D63]">
            Request an invite
          </Link>
          <Link href="/faq" className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold text-sm text-[#0B5D63] border border-[#0B5D63]">
            Help & FAQ
          </Link>
        </div>
      </main>
    </div>
  );
}

const VALUES = [
  { title: "Trusted introductions", body: "Every referral is tracked. The person who made the introduction always gets the credit." },
  { title: "Privacy by design", body: "Phone numbers and emails are never shown on screen. Contact details are gated behind accepted referrals." },
  { title: "Real verification", body: "Businesses earn a Verified badge only after the admin team checks their documents." },
  { title: "No bypass", body: "Members who find a service through Seekers carry the community discount. Going around the platform means leaving that benefit on the table." },
];
