"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  directoryVisible: boolean;
  leaderboardOptIn: boolean;
  spotlightOptIn: boolean;
};

export default function PrivacyClient({ directoryVisible, leaderboardOptIn, spotlightOptIn }: Props) {
  const router = useRouter();
  const [dirVisible, setDirVisible] = useState(directoryVisible);
  const [leaderboard, setLeaderboard] = useState(leaderboardOptIn);
  const [spotlight, setSpotlight] = useState(spotlightOptIn);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        directory_visible: dirVisible,
        leaderboard_opt_in: leaderboard,
        spotlight_opt_in: spotlight,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save");
    } else {
      setSaved(true);
      setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
    }
    setSaving(false);
  }

  const settings = [
    {
      key: "dir",
      label: "Show me in the Members Directory",
      sub: "Other members can find you by name, company or industry. Your phone number is never shown.",
      value: dirVisible,
      set: setDirVisible,
    },
    {
      key: "lb",
      label: "Include me on the referral leaderboard",
      sub: "Your name and referral count appear on the community leaderboard.",
      value: leaderboard,
      set: setLeaderboard,
    },
    {
      key: "sp",
      label: "Allow member spotlights",
      sub: "The community team may feature your story in a spotlight post. You can opt out any time.",
      value: spotlight,
      set: setSpotlight,
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#4F5B59] text-sm">← Back</button>
        <h1 className="font-bold text-xl text-[#15201E]">Privacy &amp; visibility</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden mb-4">
        {settings.map((s, i) => (
          <div
            key={s.key}
            className={`flex items-start justify-between px-5 py-4 gap-4 ${i < settings.length - 1 ? "border-b border-[#E5E7E6]" : ""}`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-[#15201E]">{s.label}</p>
              <p className="text-xs text-[#4F5B59] mt-0.5">{s.sub}</p>
            </div>
            <button
              type="button"
              onClick={() => { s.set(v => !v); setSaved(false); }}
              role="switch"
              aria-checked={s.value}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5"
              style={{ background: s.value ? "#0B5D63" : "#D1D5D4" }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ left: s.value ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full h-12 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
        style={{ background: saved ? "#17663A" : "#0B5D63" }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
