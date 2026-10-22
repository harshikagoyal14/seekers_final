"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Real Estate", "Manufacturing",
  "Healthcare", "Education", "Legal", "Consulting", "Retail & E-commerce",
  "Media & Marketing", "Construction", "Logistics", "Food & Hospitality",
  "Insurance", "Investment & Wealth", "Other",
];

export default function EditProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [designation, setDesignation] = useState(profile.designation ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const j = await res.json();
    if (res.ok) setPhotoUrl(j.url);
    else setError(j.error ?? "Upload failed");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, designation, company, industry, location, bio }),
    });
    if (res.ok) {
      router.push("/me");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#4F5B59] text-sm">← Back</button>
        <h1 className="font-bold text-xl text-[#15201E]">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 group"
            style={{ background: "#0B5D63" }}
            disabled={uploading}
          >
            {photoUrl
              ? <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-lg">{initials}</span>}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs">{uploading ? "…" : "Edit"}</span>
            </div>
          </button>
          <div>
            <p className="text-sm font-medium text-[#15201E]">Profile photo</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#0B5D63] mt-0.5"
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Upload new photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Full name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Designation</label>
          <input
            value={designation}
            onChange={e => setDesignation(e.target.value)}
            placeholder="e.g. Founder, CFO, Freelance Architect"
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Company / Organisation</label>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Industry</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">City</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="A brief intro (2–3 sentences)"
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
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
