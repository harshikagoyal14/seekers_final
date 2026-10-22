import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin · Wealth Seekers Leads" };

type LeadRow = {
  id: string;
  name: string;
  contact_encrypted: string;
  interest: string | null;
  consent_at: string;
  profiles: { name: string } | null;
};

export default async function WealthSeekersLeadsPage() {
  await requireAdmin();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: leads } = await db
    .from("ws_leads")
    .select("id, name, contact_encrypted, interest, consent_at, profiles(name)")
    .order("consent_at", { ascending: false })
    .limit(100) as { data: LeadRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-[#4F5B59]">← Admin</Link>
        <h1 className="font-bold text-xl text-[#15201E]">Wealth Seekers Applications</h1>
      </div>
      <p className="text-sm text-[#4F5B59] mb-6">{(leads ?? []).length} applications. Contact is stored encrypted — shown as-is if encryption key not configured.</p>

      {(leads ?? []).length === 0 ? (
        <p className="text-sm text-[#4F5B59]">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {(leads ?? []).map(l => (
            <div key={l.id} className="bg-white rounded-2xl p-4 border border-[#E5E7E6]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-[#15201E]">{l.name}</p>
                  {l.profiles && (
                    <p className="text-xs text-[#0B5D63]">Member: {l.profiles.name}</p>
                  )}
                  <p className="text-xs text-[#4F5B59] mt-0.5 font-mono break-all">{l.contact_encrypted}</p>
                  {l.interest && (
                    <p className="text-xs text-[#4F5B59] mt-1">Interest: {l.interest}</p>
                  )}
                </div>
                <p className="text-xs text-[#4F5B59] shrink-0">
                  {new Date(l.consent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
