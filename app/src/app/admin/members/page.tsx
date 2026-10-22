import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · Members" };

type MemberRow = {
  id: string;
  name: string;
  company: string | null;
  location: string | null;
  industry: string | null;
  roles: string[];
  tier: string;
  created_at: string;
  invite_code: string;
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminMembersPage({ searchParams }: Props) {
  await requireAdmin();
  const { q } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  let query = db
    .from("profiles")
    .select("id, name, company, location, industry, roles, tier, created_at, invite_code")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data: members } = await query as { data: MemberRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-bold text-xl text-[#15201E] mb-4">Members</h1>

      <form method="GET" className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="flex-1 h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
        />
        <button type="submit" className="h-10 px-4 rounded-xl text-white text-sm font-medium" style={{ background: "#0B5D63" }}>
          Search
        </button>
      </form>

      <p className="text-xs text-[#4F5B59] mb-3">{(members ?? []).length} members shown</p>

      <div className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden">
        {(members ?? []).map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center gap-4 px-4 py-3 ${i < (members ?? []).length - 1 ? "border-b border-[#E5E7E6]" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#15201E] truncate">{m.name}</p>
              <p className="text-xs text-[#4F5B59]">
                {[m.company, m.location].filter(Boolean).join(" · ")}
                {m.industry && ` · ${m.industry}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex gap-1 justify-end">
                {(m.roles ?? []).filter(r => r !== "member").map(r => (
                  <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F2F2] text-[#0B5D63] font-medium">
                    {r}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#4F5B59] mt-0.5">
                {new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
