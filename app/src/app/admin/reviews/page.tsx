import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin · Reviews" };

type ReviewRow = {
  id: string;
  rating: number | null;
  text: string;
  status: string;
  created_at: string;
  business_profiles: { name: string } | null;
  profiles: { name: string } | null;
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminReviewsPage({ searchParams }: Props) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: reviews } = await db
    .from("reviews")
    .select("id, rating, text, status, created_at, business_profiles(name), profiles!reviews_author_profile_id_fkey(name)")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(50) as { data: ReviewRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin" className="text-sm text-[#4F5B59]">← Admin</Link>
        <h1 className="font-bold text-xl text-[#15201E]">Reviews</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending","approved","rejected"].map(s => (
          <Link
            key={s}
            href={`/admin/reviews?status=${s}`}
            className="h-9 px-4 rounded-xl text-sm font-medium capitalize"
            style={status === s
              ? { background: "#0B5D63", color: "#fff" }
              : { background: "#F6F7F5", color: "#4F5B59" }}
          >
            {s}
          </Link>
        ))}
      </div>

      {(reviews ?? []).length === 0 ? (
        <p className="text-sm text-[#4F5B59]">No {status} reviews.</p>
      ) : (
        <div className="space-y-3">
          {(reviews ?? []).map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-[#E5E7E6]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[#15201E]">
                    {r.profiles?.name ?? "Unknown"} → {r.business_profiles?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-[#4F5B59]">
                    {"★".repeat(r.rating ?? 0)}{"☆".repeat(5 - (r.rating ?? 0))} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#15201E]">{r.text}</p>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <form action="/api/admin/reviews" method="POST">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="approve" />
                    <button type="submit" className="h-8 px-3 rounded-xl text-xs font-medium text-white" style={{ background: "#0B5D63" }}>
                      Approve
                    </button>
                  </form>
                  <form action="/api/admin/reviews" method="POST">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="reject" />
                    <button type="submit" className="h-8 px-3 rounded-xl text-xs font-medium border border-[#E5E7E6] text-[#4F5B59]">
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
