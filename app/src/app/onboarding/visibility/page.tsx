"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/app/onboarding/profile/page";

type Props = { searchParams: Promise<{ owner?: string; inv?: string }> };

export default function OnboardingVisibilityPage({ searchParams }: Props) {
  const params    = use(searchParams);
  const router    = useRouter();
  const [visible, setVisible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleContinue() {
    if (visible === null) { setError("Please make a choice."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directory_visible: visible }),
    });
    if (!res.ok) { setError("Could not save preference."); setLoading(false); return; }
    const qs = params.owner ? `?owner=${params.owner}` : params.inv ? `?inv=${params.inv}` : "";
    router.push(`/onboarding/business${qs}`);
  }

  return (
    <OnboardingShell step={2} total={3} title="Who can find you?" sub="Your phone number is never shown. You control your listing.">
      <div className="space-y-3 mb-6">
        <VisibilityCard chosen={visible === true}  onClick={() => setVisible(true)}
          title="Show me in the directory" sub="Other members can find you by name, company or industry." icon="👁️" />
        <VisibilityCard chosen={visible === false} onClick={() => setVisible(false)}
          title="Keep me hidden for now" sub="You won't appear in any search. Change this any time." icon="🔒" />
      </div>
      {error && <div className="rounded-xl p-3 text-sm mb-4" style={{ background: "#FBE9E6", color: "#A52A1C" }}>{error}</div>}
      <Button onClick={handleContinue} loading={loading} className="w-full">Continue →</Button>
    </OnboardingShell>
  );
}

function VisibilityCard({ chosen, onClick, title, sub, icon }: {
  chosen: boolean; onClick: () => void; title: string; sub: string; icon: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left p-4 rounded-xl border-2 transition-all"
      style={{
        borderColor: chosen ? "var(--brand)" : "var(--border)",
        background: chosen ? "#EAF4F4" : "#fff",
        boxShadow: chosen ? "0 0 0 3px rgba(11,93,99,.1)" : "none",
      }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{title}</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>{sub}</p>
        </div>
        {chosen && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--brand)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
