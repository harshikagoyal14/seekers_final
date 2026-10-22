"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { searchParams: Promise<{ owner?: string; inv?: string }> };

export default function OnboardingProfilePage({ searchParams }: Props) {
  const params        = use(searchParams);
  const router        = useRouter();
  const [name,        setName]      = useState("");
  const [bio,         setBio]       = useState("");
  const [company,     setCompany]   = useState("");
  const [designation, setDesig]     = useState("");
  const [industry,    setIndustry]  = useState("");
  const [location,    setLocation]  = useState("");
  const [loading,     setLoading]   = useState(false);
  const [error,       setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, company, designation, industry, location, owner_code: params.owner, invite_code: params.inv }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const qs = params.owner ? `?owner=${params.owner}` : params.inv ? `?inv=${params.inv}` : "";
    router.push(`/onboarding/visibility${qs}`);
  }

  return (
    <OnboardingShell step={1} total={3} title="Tell us about yourself" sub="This helps other members know who you are.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" required value={name} onChange={e => setName(e.target.value)} placeholder="Priya Nair" />
        <Input label="Designation" value={designation} onChange={e => setDesig(e.target.value)} placeholder="Founder, CA, Freelance designer…" />
        <Input label="Company or practice" value={company} onChange={e => setCompany(e.target.value)} placeholder="Priya Nair Capital" />
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>Industry</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="w-full h-12 rounded-xl border px-4 text-base focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--border)", color: "var(--ink)", background: "#fff" }}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <Input label="City" value={location} onChange={e => setLocation(e.target.value)} placeholder="Mumbai, Bengaluru, Delhi…" />
        <Textarea label="Short bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="What do you do and who do you help?" rows={3} />

        {error && (
          <div className="rounded-xl p-3 text-sm" style={{ background: "#FBE9E6", color: "#A52A1C" }}>{error}</div>
        )}
        <Button type="submit" loading={loading} className="w-full">Save and continue →</Button>
      </form>
    </OnboardingShell>
  );
}

export function OnboardingShell({ step, total, title, sub, children }: {
  step: number; total: number; title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--canvas)" }}>
      {/* Top strip */}
      <div className="page-header px-6 py-5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>S</div>
          <span className="font-bold text-white tracking-tight">Seekers</span>
        </Link>
        <div className="ml-auto flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all"
              style={{ width: i < step ? 24 : 10, background: i < step ? "#fff" : "rgba(255,255,255,.3)" }} />
          ))}
          <span className="ml-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,.7)" }}>
            {step}/{total}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="font-bold text-xl mb-1" style={{ color: "var(--ink)" }}>{title}</h1>
            {sub && <p className="text-sm mb-6" style={{ color: "var(--ink-2)" }}>{sub}</p>}
            {!sub && <div className="mb-6" />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const INDUSTRIES = [
  "Finance & investing", "Legal", "Textiles", "Education", "Health & wellness",
  "Tax & accounting", "Real estate", "Technology", "Food & catering",
  "Manufacturing", "Trade & exports", "Marketing", "Consulting", "Other",
];
