import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: business } = await db
    .from("business_profiles")
    .select("id, approval_status")
    .eq("owner_id", actor.id)
    .maybeSingle() as { data: { id: string; approval_status: string } | null };

  const { data: pendingReferrals } = await db
    .from("referrals")
    .select("id, state, business_profiles(name)")
    .eq("seeker_id", actor.id)
    .in("state", ["INITIATED", "ACCEPTED", "CONTACTED", "IN_PROGRESS"])
    .limit(5) as { data: Array<{ id: string; state: string; business_profiles: { name: string } | null }> | null };

  // Spotlight: active items ordered by position, fallback to top business by referrals
  const { data: spotlightRows } = await db
    .from("spotlights")
    .select("id, type, ref_id, reason")
    .lte("starts_at", new Date().toISOString())
    .or("ends_at.is.null,ends_at.gte." + new Date().toISOString())
    .order("position", { ascending: true })
    .limit(1) as { data: { id: string; type: string; ref_id: string; reason: string | null }[] | null };

  let spotlight: { name: string; bio: string | null; slug: string; reason: string } | null = null;
  if ((spotlightRows ?? []).length > 0) {
    const s = spotlightRows![0];
    if (s.type === "business") {
      const { data: biz } = await db
        .from("business_profiles")
        .select("name, bio, slug")
        .eq("id", s.ref_id)
        .single() as { data: { name: string; bio: string | null; slug: string } | null };
      if (biz) spotlight = { ...biz, reason: s.reason ?? "Featured business" };
    }
  }

  const profileComplete = !!(actor.company || actor.designation) && !!actor.bio;
  const visibilitySet   = actor.directory_visible;
  const hasBusinessListing = !!business;
  const doneCount = [profileComplete, visibilitySet, hasBusinessListing].filter(Boolean).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div className="page-header px-6 pt-8 pb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,.55)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {actor.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.7)" }}>
          Welcome back to your community.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-5 pb-10 space-y-5">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <QuickAction href="/directory"  label="Find a business" icon="🏢" />
          <QuickAction href="/invite"     label="Invite someone"  icon="✉️" />
          <QuickAction href="/referrals"  label="Make a referral" icon="🤝" />
        </div>

        {/* Spotlight */}
        {spotlight && (
          <div className="rounded-2xl p-5 relative overflow-hidden border border-[#0B5D63]" style={{ background: "linear-gradient(135deg,#EAF4F4,#F6F7F5)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B5D63] mb-1">✦ Spotlight · {spotlight.reason}</p>
            <p className="font-bold text-base text-[#15201E]">{spotlight.name}</p>
            {spotlight.bio && (
              <p className="text-xs text-[#4F5B59] mt-1 line-clamp-2">{spotlight.bio}</p>
            )}
            <Link
              href={`/directory/${spotlight.slug}`}
              className="inline-flex items-center mt-3 h-8 px-4 rounded-xl text-xs font-semibold text-white"
              style={{ background: "#0B5D63" }}
            >
              View business →
            </Link>
          </div>
        )}

        {/* Onboarding checklist */}
        {doneCount < 3 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-base" style={{ color: "var(--ink)" }}>Finish setting up</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-2)" }}>Complete your profile to get the most from Seekers</p>
              </div>
              {/* Progress ring */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E2E6E5" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#0B5D63" strokeWidth="4"
                    strokeDasharray={`${(doneCount/3)*125.6} 125.6`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: "var(--brand)" }}>
                  {doneCount}/3
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <ChecklistItem step={1} label="Complete your profile" sub="Add your company, role and a short bio." done={profileComplete} href="/me/profile" cta="Edit profile" />
              <ChecklistItem step={2} label="Set your visibility" sub="You're hidden from the directory until you switch it on." done={visibilitySet} href="/me/profile" cta="Set visibility" />
              <ChecklistItem step={3} label="List your business" sub="Get a public page with catalogue and enquiry button." done={hasBusinessListing} href="/my-business/edit" cta="List my business" />
            </div>
          </div>
        )}

        {/* Referrals waiting */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base" style={{ color: "var(--ink)" }}>Waiting on you</h2>
            <Link href="/referrals" className="text-xs font-semibold" style={{ color: "var(--brand)" }}>View all →</Link>
          </div>
          {(pendingReferrals ?? []).length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>No active referrals</p>
              <p className="text-xs mb-4" style={{ color: "var(--ink-2)" }}>Refer a member to a business you trust.</p>
              <Link href="/referrals" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--brand)" }}>
                Make a referral
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {(pendingReferrals ?? []).map(r => (
                <Link key={r.id} href="/referrals"
                  className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[#F0F8F8] card-hover"
                  style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{r.business_profiles?.name ?? "Business"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-2)" }}>{r.state.replace(/_/g, " ").toLowerCase()}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#EAF4F4", color: "var(--brand)" }}>View →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Invite banner */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#083F43,#0B5D63)",
        }}>
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#fff", transform: "translate(30%,-30%)" }} />
          <p className="font-bold text-white mb-1">Invite someone you trust ✨</p>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,.75)" }}>
            Your code: <span className="font-mono font-bold text-white">{actor.invite_code}</span>
          </p>
          <Link href="/invite"
            className="inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>
            Share invite link
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href}
      className="card card-hover flex flex-col items-center justify-center text-center p-4 rounded-2xl gap-2 text-xs font-semibold"
      style={{ color: "var(--brand)", minHeight: 80 }}>
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );
}

function ChecklistItem({ step, label, sub, done, href, cta }: {
  step: number; label: string; sub: string; done: boolean; href: string; cta: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 mt-0.5">
        {done ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#17663A" }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
            style={{ borderColor: "var(--border)", color: "var(--ink-2)" }}>{step}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{
          color: done ? "var(--ink-2)" : "var(--ink)",
          textDecoration: done ? "line-through" : "none",
        }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-2)" }}>{sub}</p>
        {!done && (
          <Link href={href}
            className="inline-flex items-center justify-center mt-2 h-8 px-4 rounded-lg text-xs font-semibold border transition-colors hover:bg-[#EAF4F4]"
            style={{ borderColor: "var(--brand)", color: "var(--brand)" }}>
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}
