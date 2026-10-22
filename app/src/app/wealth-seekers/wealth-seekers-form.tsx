"use client";
import { useState } from "react";

const INTEREST_OPTIONS = [
  "Angel investing / early stage",
  "Family office / HNI wealth management",
  "Co-investing / syndicates",
  "Deal sourcing for my portfolio",
  "Real estate investments",
  "Other",
];

export default function WealthSeekersForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [interest, setInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setError("Please confirm your consent"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/wealth-seekers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, interest }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong");
    }
    setSaving(false);
  }

  if (done) {
    return (
      <div className="bg-white/10 rounded-2xl p-8 text-center">
        <p className="text-3xl mb-3">✓</p>
        <p className="font-semibold text-lg mb-2">Application received</p>
        <p className="text-white/70 text-sm">
          We&apos;ll review your application and reach out within 3–5 business days. Only verified members are admitted.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-2xl p-6">
      <h2 className="font-semibold text-lg mb-1">Request access</h2>
      <p className="text-white/60 text-sm mb-5">Applications are reviewed by the Seekers team. We admit selectively.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Full name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full h-11 px-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#4BB8BF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Phone or email *</label>
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
            placeholder="How should we reach you?"
            className="w-full h-11 px-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#4BB8BF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Primary interest</label>
          <select
            value={interest}
            onChange={e => setInterest(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-[#083F43] border border-white/20 text-white text-sm outline-none focus:border-[#4BB8BF]"
          >
            <option value="">Select…</option>
            {INTEREST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 accent-[#4BB8BF]"
          />
          <span className="text-xs text-white/60 leading-relaxed">
            I understand that Wealth Seekers is a member networking layer only. Seekers does not provide regulated financial advice. My contact details will be stored securely and used only for this application.
          </span>
        </label>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={saving || !consent}
          className="w-full h-12 rounded-xl font-semibold text-sm text-[#083F43] bg-white disabled:opacity-50 transition-opacity"
        >
          {saving ? "Submitting…" : "Apply for access"}
        </button>
      </form>
    </div>
  );
}
