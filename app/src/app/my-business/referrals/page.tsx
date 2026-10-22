import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { STATUS_LABEL, type ReferralStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Incoming Referrals" };

type ReferralRow = {
  id: string;
  code: string;
  state: string;
  note: string | null;
  deal_value_paise: number | null;
  credits: number | null;
  created_at: string;
  referrer: { name: string; location: string | null } | null;
};

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

const NEXT_STATES: Record<string, { label: string; state: string }[]> = {
  INITIATED:   [{ label: "Accept", state: "ACCEPTED" }, { label: "Decline", state: "CLOSED_LOST" }],
  ACCEPTED:    [{ label: "Contacted", state: "CONTACTED" }, { label: "Decline", state: "CLOSED_LOST" }],
  CONTACTED:   [{ label: "In progress", state: "IN_PROGRESS" }, { label: "No deal", state: "CLOSED_LOST" }],
  IN_PROGRESS: [{ label: "Closed — won", state: "CLOSED_WON" }, { label: "No deal", state: "CLOSED_LOST" }],
};

export default async function IncomingReferralsPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: biz } = await db
    .from("business_profiles")
    .select("id, name")
    .eq("owner_id", actor.id)
    .single() as { data: { id: string; name: string } | null };

  if (!biz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#4F5B59] mb-4">You don&apos;t have a business listing yet.</p>
        <Link href="/my-business/edit" className="text-sm text-[#0B5D63]">List your business →</Link>
      </div>
    );
  }

  const { data: referrals } = await db
    .from("referrals")
    .select(`
      id, code, state, note, deal_value_paise, credits, created_at,
      referrer:profiles!referrals_referrer_id_fkey(name, location)
    `)
    .eq("business_id", biz.id)
    .order("created_at", { ascending: false })
    .limit(50) as { data: ReferralRow[] | null };

  const list = referrals ?? [];
  const actionable = list.filter(r => ["INITIATED", "ACCEPTED", "CONTACTED", "IN_PROGRESS"].includes(r.state));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-xl text-[#15201E]">Referrals</h1>
          <p className="text-sm text-[#4F5B59]">{biz.name}</p>
        </div>
        {actionable.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: "#0B5D63" }}>
            {actionable.length} need action
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">🤝</p>
          <p className="text-sm text-[#4F5B59]">No referrals yet. Members will refer contacts once your listing is live.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(r => {
            const label = STATUS_LABEL[r.state as ReferralStatus] ?? r.state;
            const colour = STATE_COLOUR[r.state] ?? "bg-[#F6F7F5] text-[#4F5B59]";
            const transitions = NEXT_STATES[r.state] ?? [];
            const referrer = r.referrer as { name: string; location: string | null } | null;

            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#E5E7E6]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-[#15201E]">
                      Referred by {referrer?.name ?? "a member"}
                      {referrer?.location && ` · ${referrer.location}`}
                    </p>
                    <p className="text-xs text-[#4F5B59]">
                      {r.code} · {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${colour}`}>{label}</span>
                </div>

                {r.note && (
                  <p className="text-xs text-[#4F5B59] mb-3 bg-[#F6F7F5] rounded-lg px-3 py-2">{r.note}</p>
                )}

                {transitions.length > 0 && (
                  <div className="flex gap-2">
                    {transitions.map(t => (
                      <form key={t.state} action="/api/referrals/transition" method="POST">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="state" value={t.state} />
                        <button
                          type="submit"
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                            t.state.includes("LOST") || t.state === "CLOSED_LOST"
                              ? "border-[#E5E7E6] text-[#4F5B59]"
                              : "border-[#0B5D63] text-[#0B5D63]"
                          }`}
                        >
                          {t.label}
                        </button>
                      </form>
                    ))}
                  </div>
                )}

                {r.state === "CLOSED_WON" && r.credits != null && (
                  <p className="text-xs font-semibold text-[#0B5D63] mt-2">
                    ₹{(r.credits / 100).toLocaleString("en-IN")} credits to be settled with referrer
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
