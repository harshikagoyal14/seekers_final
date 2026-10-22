"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReferBusinessButton({
  businessId,
  businessName,
  referralFeePct,
}: {
  businessId: string;
  businessName: string;
  referralFeePct: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seekerName, setSeekerName] = useState("");
  const [seekerContact, setSeekerContact] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seekerName.trim() || !seekerContact.trim()) {
      setError("Name and contact are required");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: businessId,
        seeker_name: seekerName,
        seeker_contact: seekerContact,
        note,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to send referral");
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
    router.refresh();
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-sm text-[#15201E]">Referral sent!</p>
        <p className="text-xs text-[#4F5B59] mt-1">
          {businessName} will receive this introduction.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden">
      {/* Header / trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 text-left flex items-center justify-between"
      >
        <div>
          <p className="font-semibold text-sm text-[#15201E]">Refer someone to {businessName}</p>
          {referralFeePct > 0 && (
            <p className="text-xs text-[#0B5D63] mt-0.5">Earn {referralFeePct}% on a successful close</p>
          )}
        </div>
        <span className="text-[#4F5B59] text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-[#E5E7E6] px-5 pb-5 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#15201E] mb-1">Contact&apos;s name *</label>
            <input
              value={seekerName}
              onChange={e => setSeekerName(e.target.value)}
              required
              placeholder="e.g. Priya Mehta"
              className="w-full h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15201E] mb-1">Phone or email *</label>
            <input
              value={seekerContact}
              onChange={e => setSeekerContact(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15201E] mb-1">What do they need? (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-10 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: "#0B5D63" }}
          >
            {saving ? "Sending…" : "Send referral"}
          </button>
        </form>
      )}
    </div>
  );
}
