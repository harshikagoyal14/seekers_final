import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Business Directory" };

type BusinessCard = {
  id: string;
  name: string;
  slug: string;
  type: string;
  bio: string | null;
  location: string | null;
  logo_path: string | null;
  categories: { name: string } | null;
  honour_rate: number | null;
};

type Props = { searchParams: Promise<{ q?: string; cat?: string; page?: string }> };

export default async function DirectoryPage({ searchParams }: Props) {
  await resolveActor(); // ensures authenticated
  const { q, cat, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? "1"));
  const PAGE_SIZE = 20;

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  // Fetch categories for filter
  const { data: categories } = await db
    .from("categories")
    .select("id, name")
    .order("name") as { data: Array<{ id: string; name: string }> | null };

  // Build query
  let query = db
    .from("business_profiles")
    .select("id, name, slug, type, bio, location, logo_path, categories(name)")
    .eq("approval_status", "approved")
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.textSearch("fts", q.trim(), { type: "websearch" });
  }
  if (cat) {
    query = query.eq("category_id", cat);
  }

  const { data: rawBiz } = await query as { data: Omit<BusinessCard, "honour_rate">[] | null };

  // Fetch honour rates from view and merge
  const bizIds = (rawBiz ?? []).map(b => b.id);
  const honourMap: Record<string, number> = {};
  if (bizIds.length > 0) {
    const { data: honours } = await db
      .from("business_honour")
      .select("business_id, honour_rate")
      .in("business_id", bizIds) as { data: { business_id: string; honour_rate: number }[] | null };
    for (const h of honours ?? []) {
      honourMap[h.business_id] = Math.round(h.honour_rate * 100);
    }
  }

  const businesses: BusinessCard[] = (rawBiz ?? []).map(b => ({
    ...b,
    honour_rate: honourMap[b.id] ?? null,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-bold text-2xl text-[#15201E] mb-4">Business Directory</h1>

      {/* Search + filter */}
      <form method="GET" className="flex gap-2 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search businesses…"
          className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
        />
        <select
          name="cat"
          defaultValue={cat}
          className="h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
        >
          <option value="">All categories</option>
          {(categories ?? []).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 px-4 rounded-xl text-white text-sm font-medium"
          style={{ background: "#0B5D63" }}
        >
          Search
        </button>
      </form>

      {/* Results */}
      {(businesses ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#4F5B59]">No businesses found.</p>
          {(q || cat) && (
            <Link href="/directory" className="text-sm text-[#0B5D63] mt-2 inline-block">Clear filters</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(businesses ?? []).map(b => (
            <Link
              key={b.id}
              href={`/directory/${b.slug}`}
              className="block bg-white rounded-2xl p-4 border border-[#E5E7E6] hover:border-[#0B5D63] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {b.logo_path && (
                    <img src={b.logo_path} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E5E7E6]" />
                  )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#15201E] text-sm leading-tight">{b.name}</p>
                  <p className="text-xs text-[#4F5B59] mt-0.5">
                    {b.categories?.name ?? b.type}
                    {b.location && ` · ${b.location}`}
                  </p>
                  {b.bio && (
                    <p className="text-xs text-[#4F5B59] mt-1.5 line-clamp-2">{b.bio}</p>
                  )}
                </div>
                </div>
                {b.honour_rate != null && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-[#0B5D63]">{b.honour_rate.toFixed(0)}%</p>
                    <p className="text-[10px] text-[#4F5B59]">honour</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(businesses ?? []).length === PAGE_SIZE && (
        <div className="flex justify-center mt-6">
          <Link
            href={`/directory?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), page: String(pageNum + 1) })}`}
            className="px-6 py-2.5 rounded-xl border border-[#0B5D63] text-sm text-[#0B5D63] font-medium"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
