import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("name, grandfathered, created_at")
    .eq("user_id", user!.id)
    .single();
  const profile = profileRow as { name: string; grandfathered: boolean; created_at: string } | null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#15201E" }}>
          {greeting}, {profile?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#4F5B59" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <QuickAction href="/directory" label="Find a business" />
        <QuickAction href="/invite" label="Invite a member" />
        <QuickAction href="/community/knowledge" label="Share an article" />
      </div>

      {/* Onboarding checklist placeholder */}
      <div className="bg-white rounded-2xl p-6 mb-6 border" style={{ borderColor: "#E5E7E6" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: "#15201E" }}>Finish setting up</h2>
          <span className="text-xs" style={{ color: "#4F5B59" }}>0 of 4 done</span>
        </div>
        <div className="space-y-3">
          <ChecklistItem step={1} label="Complete your profile" sub="Photo, company and what you do." done={false} href="/me/profile" cta="Edit profile" />
          <ChecklistItem step={2} label="Choose who can find you" sub="You are hidden from the members directory until you switch it on." done={false} href="/me/profile" cta="Set visibility" />
          <ChecklistItem step={3} label="List your business" sub="A public page you can share on WhatsApp, with a catalogue and an enquiry button." done={false} href="/my-business/edit" cta="List your business" />
          <ChecklistItem step={4} label="Read one Knowledge post" sub="Guides written by members: markets, tax, legal, running a business." done={false} href="/community/knowledge" cta="Open Knowledge" />
        </div>
      </div>

      {/* Empty state for referrals */}
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#E5E7E6" }}>
        <h2 className="font-semibold text-base mb-1" style={{ color: "#15201E" }}>Waiting on you</h2>
        <p className="text-sm mb-4" style={{ color: "#4F5B59" }}>No referrals waiting for your action.</p>
        <Link
          href="/referrals"
          className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity"
          style={{ background: "#0B5D63" }}
        >
          Refer someone
        </Link>
      </div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center text-center p-4 rounded-xl text-sm font-medium border transition-colors hover:bg-[#E8F2F2]"
      style={{ borderColor: "#E5E7E6", color: "#0B5D63", background: "#fff" }}
    >
      {label}
    </Link>
  );
}

function ChecklistItem({ step, label, sub, done, href, cta }: {
  step: number; label: string; sub: string; done: boolean; href: string; cta: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">
        {done ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#17663A" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold" style={{ borderColor: "#D1D5D4", color: "#4F5B59" }}>{step}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm" style={{ color: done ? "#4F5B59" : "#15201E", textDecoration: done ? "line-through" : "none" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#4F5B59" }}>{sub}</p>
        {!done && (
          <Link href={href} className="inline-flex items-center justify-center mt-2 h-8 px-4 rounded-lg text-xs font-semibold border transition-colors" style={{ borderColor: "#0B5D63", color: "#0B5D63" }}>
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}
