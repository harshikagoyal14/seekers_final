"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; referral_fee_allowed: boolean };
type BusinessRow = {
  id: string; name: string; type: string; category_id: string | null;
  bio: string | null; location: string | null; years: number | null;
  website: string | null; instagram: string | null; linkedin: string | null;
  referral_fee_pct: number; approval_status: string; logo_path: string | null;
};

const BUSINESS_TYPES = [
  { value: "product", label: "Product / SaaS" },
  { value: "service", label: "Service / Consulting" },
  { value: "freelance", label: "Freelance / Independent" },
  { value: "agency", label: "Agency / Studio" },
  { value: "manufacturer", label: "Manufacturer / Trader" },
  { value: "other", label: "Other" },
];

export default function BusinessEditForm({
  categories,
  existing,
}: {
  categories: Category[];
  existing: BusinessRow | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedCatId, setSelectedCatId] = useState(existing?.category_id ?? "");
  const [logoUrl, setLogoUrl] = useState(existing?.logo_path ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    const j = await res.json();
    if (res.ok) setLogoUrl(j.url);
    else setError(j.error ?? "Upload failed");
    setLogoUploading(false);
  }

  const selectedCat = categories.find(c => c.id === selectedCatId);
  const feeAllowed = selectedCat?.referral_fee_allowed !== false;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body: Record<string, string | number> = {};
    for (const [k, v] of form.entries()) {
      if (typeof v === "string" && v.trim()) {
        body[k] = k === "years" || k === "referral_fee_pct" ? Number(v) : v.trim();
      }
    }

    const method = existing ? "PATCH" : "POST";
    const res = await fetch("/api/business", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/me");
      router.refresh();
    } else {
      const j = await res.json();
      setError(j.error ?? "Failed to save");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {existing && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          existing.approval_status === "approved"
            ? "bg-green-50 text-green-700"
            : existing.approval_status === "pending"
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700"
        }`}>
          Status: {existing.approval_status}
          {existing.approval_status === "pending" && " — under review"}
        </div>
      )}

      {/* Logo upload */}
      {existing && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => logoRef.current?.click()}
            disabled={logoUploading}
            className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 group border border-[#E5E7E6]"
            style={{ background: "#F6F7F5" }}
          >
            {logoUrl
              ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              : <span className="text-2xl">🏢</span>}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs">{logoUploading ? "…" : "Edit"}</span>
            </div>
          </button>
          <div>
            <p className="text-sm font-medium text-[#15201E]">Business logo</p>
            <button type="button" onClick={() => logoRef.current?.click()} className="text-xs text-[#0B5D63] mt-0.5" disabled={logoUploading}>
              {logoUploading ? "Uploading…" : "Upload logo"}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#15201E] mb-1">Business name *</label>
        <input
          name="name"
          required
          defaultValue={existing?.name}
          className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#15201E] mb-1">Business type *</label>
        <select
          name="type"
          required
          defaultValue={existing?.type}
          className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
        >
          <option value="">Select type</option>
          {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#15201E] mb-1">Category *</label>
        <select
          name="category_id"
          required
          value={selectedCatId}
          onChange={e => setSelectedCatId(e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
        >
          <option value="">Select category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedCat && !selectedCat.referral_fee_allowed && (
          <p className="text-xs text-amber-600 mt-1">This is a regulated category. Referral credits are not available.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#15201E] mb-1">About</label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={existing?.bio ?? ""}
          className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
          placeholder="What you do, who you serve, what makes you different"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">City</label>
          <input
            name="location"
            defaultValue={existing?.location ?? ""}
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
            placeholder="Mumbai"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Years in business</label>
          <input
            name="years"
            type="number"
            min={0}
            max={100}
            defaultValue={existing?.years ?? ""}
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#15201E] mb-1">Website</label>
        <input
          name="website"
          type="url"
          defaultValue={existing?.website ?? ""}
          className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          placeholder="https://..."
        />
      </div>

      {feeAllowed && (
        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Referral fee %</label>
          <input
            name="referral_fee_pct"
            type="number"
            min={0}
            max={50}
            step={0.5}
            defaultValue={existing?.referral_fee_pct ?? 0}
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
            placeholder="e.g. 10"
          />
          <p className="text-xs text-[#4F5B59] mt-1">Percentage of deal value you pay to the referring member on a successful close.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 h-12 rounded-xl border border-[#E5E7E6] text-sm text-[#4F5B59] font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-12 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
          style={{ background: "#0B5D63" }}
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Submit for review"}
        </button>
      </div>

      <p className="text-xs text-[#4F5B59] text-center">
        Your listing will be reviewed before going public. Logo upload and catalogue items can be added after approval.
      </p>
    </form>
  );
}
