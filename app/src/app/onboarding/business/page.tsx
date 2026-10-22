"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/app/onboarding/profile/page";

export default function OnboardingBusinessPage() {
  const router    = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <OnboardingShell step={3} total={3} title="Do you run a business?" sub="List it and get a shareable page with your catalogue and an enquiry button. You can always do this later.">
      <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: "#EAF4F4" }}>
        <span className="text-2xl leading-none">🏢</span>
        <div className="text-sm" style={{ color: "var(--ink)" }}>
          <p className="font-semibold mb-1">What you get with a listing</p>
          <ul className="space-y-1 text-xs" style={{ color: "var(--ink-2)" }}>
            <li>✓ Public business profile page</li>
            <li>✓ Catalogue with products & services</li>
            <li>✓ Direct enquiry button for leads</li>
            <li>✓ Referral tracking dashboard</li>
          </ul>
        </div>
      </div>
      <div className="space-y-3">
        <Button onClick={() => { setLoading(true); router.push("/my-business/edit?from=onboarding"); }} loading={loading} className="w-full">
          List my business
        </Button>
        <Button onClick={() => router.push("/home")} variant="ghost" className="w-full">
          Skip for now
        </Button>
      </div>
    </OnboardingShell>
  );
}
