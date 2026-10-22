import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import AdminKnowledgeActions from "./admin-knowledge-actions";

export const metadata: Metadata = { title: "Admin · Knowledge" };

type PostRow = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminKnowledgePage({ searchParams }: Props) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: posts } = await db
    .from("knowledge_posts")
    .select("id, url, title, description, category, status, created_at, profiles(name)")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(50) as { data: PostRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-bold text-xl text-[#15201E] mb-4">Knowledge Posts</h1>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected"].map(s => (
          <a
            key={s}
            href={`/admin/knowledge?status=${s}`}
            className="h-8 px-3 rounded-full text-xs font-medium capitalize"
            style={{
              background: status === s ? "#0B5D63" : "#fff",
              color: status === s ? "#fff" : "#4F5B59",
              border: "1px solid #E5E7E6",
            }}
          >
            {s}
          </a>
        ))}
      </div>

      {(posts ?? []).length === 0 ? (
        <p className="text-sm text-[#4F5B59]">No posts with status "{status}".</p>
      ) : (
        <div className="space-y-3">
          {(posts ?? []).map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#E5E7E6]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-[#0B5D63] uppercase">{p.category}</span>
                  <p className="font-semibold text-sm text-[#15201E] mt-0.5 line-clamp-1">{p.title}</p>
                  {p.description && <p className="text-xs text-[#4F5B59] mt-0.5 line-clamp-1">{p.description}</p>}
                  <p className="text-xs text-[#4F5B59] mt-1">
                    By {(p.profiles as { name: string } | null)?.name ?? "member"} ·{" "}
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0B5D63] mt-0.5 inline-block truncate max-w-xs">
                    {p.url} ↗
                  </a>
                </div>
                {status === "pending" && <AdminKnowledgeActions id={p.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
