import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default async function MePage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Get business listing if any
  const { data: business } = await db
    .from("business_profiles")
    .select("id, name, slug, approval_status")
    .eq("owner_id", actor.id)
    .maybeSingle() as { data: { id: string; name: string; slug: string; approval_status: string } | null };

  // Get member balance
  const { data: balance } = await db
    .from("member_balance")
    .select("balance_paise")
    .eq("profile_id", actor.id)
    .maybeSingle() as { data: { balance_paise: number } | null };

  const credits = balance?.balance_paise ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7E6] mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ background: "#0B5D63" }}
          >
            {actor.photo_url
              ? <img src={actor.photo_url} alt={actor.name} className="w-full h-full object-cover rounded-full" />
              : actor.name.slice(0, 2).toUpperCase()
            }
          </div>
          <div>
            <p className="font-bold text-lg text-[#15201E]">{actor.name}</p>
            {actor.designation && actor.company && (
              <p className="text-sm text-[#4F5B59]">{actor.designation} · {actor.company}</p>
            )}
            {actor.location && <p className="text-xs text-[#4F5B59]">{actor.location}</p>}
          </div>
        </div>

        <Link
          href="/me/profile"
          className="block w-full text-center py-2.5 rounded-xl border border-[#0B5D63] text-[#0B5D63] text-sm font-medium"
        >
          Edit profile
        </Link>
      </div>

      {/* Credits */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#4F5B59] mb-0.5">Seeker Credits</p>
            <p className="font-bold text-2xl text-[#15201E]">
              ₹{(credits / 100).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-3xl">🪙</div>
        </div>
        <p className="text-xs text-[#4F5B59] mt-2">Credits are earned through referrals and have no cash value.</p>
      </div>

      {/* Business listing */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] mb-4">
        <p className="font-semibold text-sm text-[#15201E] mb-3">My Business</p>
        {business ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#15201E]">{business.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                business.approval_status === "approved"
                  ? "bg-green-50 text-green-700"
                  : business.approval_status === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {business.approval_status}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/my-business/edit" className="text-xs text-[#0B5D63] font-medium">Edit listing →</Link>
              <Link href="/my-business/enquiries" className="text-xs text-[#0B5D63] font-medium">Enquiries →</Link>
              <Link href="/my-business/catalogue" className="text-xs text-[#0B5D63] font-medium">Catalogue →</Link>
              <Link href="/my-business/referrals" className="text-xs text-[#0B5D63] font-medium">Referrals →</Link>
              {business.approval_status === "approved" && (
                <Link href={`/business/${business.slug}`} className="text-xs text-[#4F5B59]" target="_blank">
                  Public page →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#4F5B59] mb-3">List your business to receive referrals and enquiries from members.</p>
            <Link
              href="/my-business/edit"
              className="inline-block px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#0B5D63" }}
            >
              List my business
            </Link>
          </div>
        )}
      </div>

      {/* Account links */}
      <div className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden">
        {[
          { label: "Notification preferences", href: "/me/notifications" },
          { label: "Privacy & visibility", href: "/me/privacy" },
          { label: "Help & support", href: "/faq" },
          { label: "Privacy notice", href: "/privacy" },
          { label: "Terms of use", href: "/terms" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7E6] last:border-0 text-sm text-[#15201E]"
          >
            {item.label}
            <span className="text-[#4F5B59]">›</span>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-[#4F5B59] mt-6">Invite code: <strong>{actor.invite_code}</strong></p>
    </div>
  );
}
