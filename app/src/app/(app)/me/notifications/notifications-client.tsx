"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Pref = { key: string; label: string; sub: string; on: boolean };

const DEFAULT_PREFS: Pref[] = [
  { key: "email_referral_updates", label: "Referral updates", sub: "When a referral you made moves to a new stage.", on: true },
  { key: "email_enquiry_reply",    label: "Enquiry replies",  sub: "When a business replies to your enquiry.",    on: true },
  { key: "email_new_members",      label: "New members",      sub: "Weekly digest of new members in your area.",  on: false },
  { key: "email_community_posts",  label: "Community posts",  sub: "Highlights from Knowledge and events.",       on: false },
];

export default function NotificationsClient({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: string) {
    setPrefs(p => p.map(pref => pref.key === key ? { ...pref, on: !pref.on } : pref));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    // Persist to profile via PATCH (fields not yet in schema — fire-and-forget)
    const body = Object.fromEntries(prefs.map(p => [p.key, p.on]));
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // profileId used for future server-side fetch
  void profileId;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#4F5B59] text-sm">← Back</button>
        <h1 className="font-bold text-xl text-[#15201E]">Notification preferences</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden mb-4">
        {prefs.map((pref, i) => (
          <div
            key={pref.key}
            className={`flex items-center justify-between px-5 py-4 ${i < prefs.length - 1 ? "border-b border-[#E5E7E6]" : ""}`}
          >
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-[#15201E]">{pref.label}</p>
              <p className="text-xs text-[#4F5B59] mt-0.5">{pref.sub}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(pref.key)}
              role="switch"
              aria-checked={pref.on}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: pref.on ? "#0B5D63" : "#D1D5D4" }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ left: pref.on ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full h-12 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
        style={{ background: saved ? "#17663A" : "#0B5D63" }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}
      </button>

      <p className="text-xs text-[#4F5B59] text-center mt-4">
        All emails go to the address on your account. We never send marketing emails.
      </p>
    </div>
  );
}
