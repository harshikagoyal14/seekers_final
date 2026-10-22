import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard" };

type LeaderRow = {
  id: string;
  name: string;
  photo_url: string | null;
  designation: string | null;
  company: string | null;
  referral_count: number;
  won_count: number;
};

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-semibold text-[#4F5B59] w-6 text-center">{rank}</span>;
}

export default async function LeaderboardPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Top 25 referrers by total referrals made (opt-in only)
  const { data: rows } = await db
    .from("referrals")
    .select("referrer_id, state, profiles!referrals_referrer_id_fkey(id, name, photo_url, designation, company, leaderboard_opt_in)")
    .not("referrer_id", "is", null) as {
      data: {
        referrer_id: string; state: string;
        profiles: { id: string; name: string; photo_url: string | null; designation: string | null; company: string | null; leaderboard_opt_in: boolean } | null;
      }[] | null
    };

  // Aggregate in JS
  const agg: Record<string, LeaderRow> = {};
  for (const r of rows ?? []) {
    const p = r.profiles;
    if (!p || !p.leaderboard_opt_in) continue;
    if (!agg[p.id]) {
      agg[p.id] = { id: p.id, name: p.name, photo_url: p.photo_url, designation: p.designation, company: p.company, referral_count: 0, won_count: 0 };
    }
    agg[p.id].referral_count++;
    if (r.state === "CLOSED_WON") agg[p.id].won_count++;
  }

  const sorted = Object.values(agg)
    .sort((a, b) => b.referral_count - a.referral_count || b.won_count - a.won_count)
    .slice(0, 25);

  const userRank = sorted.findIndex(r => r.id === actor.id) + 1;

  function initials(name: string) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="font-bold text-2xl text-[#15201E] mb-1">Leaderboard</h1>
      <p className="text-sm text-[#4F5B59] mb-6">Top referrers in the community (opt-in).</p>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7E6] text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-sm text-[#4F5B59]">No one on the leaderboard yet. Make some referrals!</p>
          <p className="text-xs text-[#4F5B59] mt-2">
            Enable leaderboard visibility in <a href="/me/privacy" className="text-[#0B5D63]">Privacy settings</a>.
          </p>
        </div>
      ) : (
        <>
          {userRank > 0 && (
            <div className="mb-4 px-4 py-2 bg-[#E8F2F2] rounded-xl text-sm text-[#0B5D63] font-medium">
              You are #{userRank} on the leaderboard
            </div>
          )}
          {!actor.leaderboard_opt_in && (
            <div className="mb-4 px-4 py-2 bg-[#FFF9E6] rounded-xl text-xs text-[#4F5B59]">
              You&apos;re not on the leaderboard.{" "}
              <a href="/me/privacy" className="text-[#0B5D63] font-medium">Enable in Privacy settings →</a>
            </div>
          )}
          <div className="space-y-2">
            {sorted.map((member, i) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border transition-colors ${member.id === actor.id ? "border-[#0B5D63]" : "border-[#E5E7E6]"}`}
              >
                <div className="w-8 flex items-center justify-center shrink-0">
                  <Medal rank={i + 1} />
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden"
                  style={{ background: "#0B5D63" }}
                >
                  {member.photo_url
                    ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    : initials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#15201E] truncate">{member.name}</p>
                  {(member.designation || member.company) && (
                    <p className="text-xs text-[#4F5B59] truncate">
                      {[member.designation, member.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-[#0B5D63]">{member.referral_count}</p>
                  <p className="text-[10px] text-[#4F5B59]">referrals</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
