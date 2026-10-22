import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Members" };

type MemberCard = {
  id: string;
  name: string;
  designation: string | null;
  company: string | null;
  location: string | null;
  industry: string | null;
  photo_url: string | null;
};

type Props = { searchParams: Promise<{ q?: string; industry?: string; page?: string }> };

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Real Estate", "Manufacturing",
  "Healthcare", "Education", "Legal", "Consulting", "Retail & E-commerce",
  "Media & Marketing", "Construction", "Logistics", "Food & Hospitality",
  "Insurance", "Investment & Wealth", "Other",
];

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default async function MembersPage({ searchParams }: Props) {
  await resolveActor();
  const { q, industry, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? "1"));
  const PAGE_SIZE = 24;

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  let query = db
    .from("profiles")
    .select("id, name, designation, company, location, industry, photo_url")
    .eq("directory_visible", true)
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)
    .order("name");

  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  if (industry) {
    query = query.eq("industry", industry);
  }

  const { data: members } = await query as { data: MemberCard[] | null };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-bold text-2xl text-[#15201E] mb-4">Members</h1>

      {/* Search + filter */}
      <form method="GET" className="flex gap-2 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="flex-1 min-w-[160px] h-11 px-4 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
        />
        <select
          name="industry"
          defaultValue={industry}
          className="h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
        >
          <option value="">All industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <button
          type="submit"
          className="h-11 px-4 rounded-xl text-white text-sm font-medium"
          style={{ background: "#0B5D63" }}
        >
          Search
        </button>
        {(q || industry) && (
          <Link href="/members" className="h-11 px-4 flex items-center rounded-xl border border-[#E5E7E6] text-sm text-[#4F5B59]">
            Clear
          </Link>
        )}
      </form>

      {/* Grid */}
      {(members ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#4F5B59]">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(members ?? []).map(m => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="bg-white rounded-2xl p-4 border border-[#E5E7E6] flex flex-col items-center text-center hover:border-[#0B5D63] transition-colors"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 mb-3 overflow-hidden"
                style={{ background: "#0B5D63" }}
              >
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                  : initials(m.name)
                }
              </div>
              <p className="font-semibold text-sm text-[#15201E] leading-tight">{m.name}</p>
              {(m.designation || m.company) && (
                <p className="text-xs text-[#4F5B59] mt-0.5 line-clamp-1">
                  {[m.designation, m.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {m.location && (
                <p className="text-xs text-[#4F5B59] mt-0.5">{m.location}</p>
              )}
              {m.industry && (
                <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[#F6F7F5] text-[#4F5B59]">
                  {m.industry}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(members ?? []).length === PAGE_SIZE && (
        <div className="flex justify-center mt-6">
          <a
            href={`/members?${new URLSearchParams({ ...(q ? { q } : {}), ...(industry ? { industry } : {}), page: String(pageNum + 1) })}`}
            className="px-6 py-2.5 rounded-xl border border-[#0B5D63] text-sm text-[#0B5D63] font-medium"
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
