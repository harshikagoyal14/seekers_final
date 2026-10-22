"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReferralRow } from "./page";
import { STATUS_LABEL, type ReferralStatus } from "@/lib/types";

type BizOption = { id: string; name: string; slug: string; referral_fee_pct: number };

const STATE_COLOUR: Record<string, string> = {
  INITIATED:   "bg-amber-50 text-amber-700",
  ACCEPTED:    "bg-amber-50 text-amber-700",
  CONTACTED:   "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  CLOSED_WON:  "bg-green-50 text-green-700",
  CLOSED_LOST: "bg-[#F6F7F5] text-[#4F5B59]",
  EXPIRED:     "bg-[#F6F7F5] text-[#4F5B59]",
  UNRESOLVED:  "bg-[#F6F7F5] text-[#4F5B59]",
  DISPUTED:    "bg-red-50 text-red-700",
};

export default function ReferralsClient({
  businesses,
  referrals: initial,
  reviewedIds: initialReviewed,
}: {
  businesses: BizOption[];
  referrals: ReferralRow[];
  reviewedIds: string[];
}) {
  const router = useRouter();
  const [referrals, setReferrals] = useState(initial);
  const [reviewedSet, setReviewedSet] = useState(new Set(initialReviewed));
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [businessId, setBusinessId] = useState("");
  const [seekerName, setSeekerName] = useState("");
  const [seekerContact, setSeekerContact] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedBiz = businesses.find(b => b.id === businessId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) { setError("Choose a business"); return; }
    if (!seekerName.trim()) { setError("Seeker name is required"); return; }
    if (!seekerContact.trim()) { setError("Contact details are required"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, seeker_name: seekerName, seeker_contact: seekerContact, note }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to create referral");
      setSaving(false);
      return;
    }

    // Refresh list
    router.refresh();
    setShowForm(false);
    setBusinessId(""); setSeekerName(""); setSeekerContact(""); setNote("");
    setSaving(false);

    // Optimistic: reload referrals
    const listRes = await fetch("/api/referrals");
    if (listRes.ok) {
      const j = await listRes.json();
      setReferrals(j.referrals ?? []);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-2xl text-[#15201E]">Referrals</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="h-10 px-4 rounded-xl text-white text-sm font-medium"
          style={{ background: "#0B5D63" }}
        >
          {showForm ? "Cancel" : "+ New referral"}
        </button>
      </div>

      {/* New referral form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] mb-5">
          <h2 className="font-semibold text-base text-[#15201E] mb-4">Refer someone to a business</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#15201E] mb-1">Business *</label>
              <select
                value={businessId}
                onChange={e => setBusinessId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
                required
              >
                <option value="">Select a business…</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.referral_fee_pct > 0 ? ` · ${b.referral_fee_pct}% fee` : ""}
                  </option>
                ))}
              </select>
              {selectedBiz && selectedBiz.referral_fee_pct > 0 && (
                <p className="text-xs text-[#0B5D63] mt-1">
                  You earn {selectedBiz.referral_fee_pct}% of the deal value as credits when this closes.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#15201E] mb-1">Seeker's name *</label>
              <input
                value={seekerName}
                onChange={e => setSeekerName(e.target.value)}
                required
                placeholder="e.g. Arjun Sharma"
                className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#15201E] mb-1">Seeker's phone or email *</label>
              <input
                value={seekerContact}
                onChange={e => setSeekerContact(e.target.value)}
                required
                placeholder="So the business can reach them"
                className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#15201E] mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="What does the seeker need?"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
              style={{ background: "#0B5D63" }}
            >
              {saving ? "Sending…" : "Send referral"}
            </button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {referrals.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🤝</div>
          <p className="font-semibold text-[#15201E] mb-1">No referrals yet</p>
          <p className="text-sm text-[#4F5B59] max-w-xs mx-auto">
            Refer a contact to any business in the directory. You earn credits when the deal closes.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 h-11 px-6 rounded-xl text-white text-sm font-medium"
            style={{ background: "#0B5D63" }}
          >
            Make your first referral
          </button>
        </div>
      )}

      {/* Referral list */}
      {referrals.length > 0 && (
        <div className="space-y-3">
          {referrals.map(r => {
            const label = STATUS_LABEL[r.state as ReferralStatus] ?? r.state;
            const colourClass = STATE_COLOUR[r.state] ?? "bg-[#F6F7F5] text-[#4F5B59]";
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#E5E7E6]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#15201E] truncate">
                      {r.business_profiles?.name ?? "—"}
                    </p>
                    <p className="text-xs text-[#4F5B59] mt-0.5">
                      {r.note?.split("\n")[0] ?? r.code}
                    </p>
                    <p className="text-xs text-[#4F5B59] mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colourClass}`}>
                      {label}
                    </span>
                    {r.credits != null && r.credits > 0 && (
                      <p className="text-xs font-semibold text-[#0B5D63]">
                        +₹{(r.credits / 100).toLocaleString("en-IN")} credits
                      </p>
                    )}
                  </div>
                </div>
                {["IN_PROGRESS", "CONTACTED"].includes(r.state) && (
                  <ConfirmDealButton referralId={r.id} onDone={() => {
                    setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, state: "CLOSED_WON" } : x));
                  }} />
                )}
                {r.state === "CLOSED_WON" && !reviewedSet.has(r.id) && (
                  <ReviewButton
                    referralId={r.id}
                    bizName={r.business_profiles?.name ?? "this business"}
                    onDone={() => setReviewedSet(prev => new Set([...prev, r.id]))}
                  />
                )}
                {r.state === "CLOSED_WON" && reviewedSet.has(r.id) && (
                  <p className="mt-2 text-xs text-[#0B5D63]">Review submitted ✓</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#4F5B59] text-center mt-8">
        Credits are earned when a referral reaches Closed · Won and are settled within 30 days.
      </p>
    </div>
  );
}

function ReviewButton({ referralId, bizName, onDone }: { referralId: string; bizName: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!rating) { setError("Pick a rating"); return; }
    if (!text.trim()) { setError("Write a review"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_id: referralId, rating, text }),
    });
    if (res.ok) { onDone(); setOpen(false); }
    else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to submit");
    }
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs border border-[#0B5D63] text-[#0B5D63] px-3 py-1.5 rounded-lg font-medium"
      >
        Leave a review
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-[#F6F7F5] rounded-xl space-y-2">
      <p className="text-xs font-medium text-[#15201E]">Review {bizName}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className="text-xl transition-opacity"
            style={{ opacity: s <= rating ? 1 : 0.3 }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={200}
        rows={2}
        placeholder="Share your experience (max 200 chars)"
        className="w-full px-3 py-2 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
      />
      <p className="text-right text-[10px] text-[#4F5B59]">{text.length}/200</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={saving}
          className="h-9 px-4 rounded-xl text-white text-xs font-semibold disabled:opacity-60"
          style={{ background: "#0B5D63" }}
        >
          {saving ? "…" : "Submit review"}
        </button>
        <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-xl border border-[#E5E7E6] text-xs text-[#4F5B59]">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ConfirmDealButton({ referralId, onDone }: { referralId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    const res = await fetch(`/api/referrals/${referralId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deal_value_paise: dealValue ? Math.round(parseFloat(dealValue) * 100) : null,
      }),
    });
    if (res.ok) { onDone(); setOpen(false); }
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs border border-[#0B5D63] text-[#0B5D63] px-3 py-1.5 rounded-lg font-medium"
      >
        Confirm deal closed
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-[#F6F7F5] rounded-xl space-y-2">
      <p className="text-xs font-medium text-[#15201E]">Confirm deal value (optional)</p>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={dealValue}
          onChange={e => setDealValue(e.target.value)}
          placeholder="Deal value in ₹"
          className="flex-1 h-9 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
        />
        <button
          onClick={confirm}
          disabled={saving}
          className="h-9 px-3 rounded-xl text-white text-xs font-semibold disabled:opacity-60"
          style={{ background: "#17663A" }}
        >
          {saving ? "…" : "Confirm"}
        </button>
        <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-xl border border-[#E5E7E6] text-xs text-[#4F5B59]">
          Cancel
        </button>
      </div>
    </div>
  );
}
