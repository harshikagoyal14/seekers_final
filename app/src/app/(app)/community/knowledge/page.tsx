import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import HelpfulButton from "./helpful-button";

export const metadata: Metadata = { title: "Knowledge" };

type PostRow = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  preview_image: string | null;
  category: string;
  source: string;
  author_id: string;
  created_at: string;
  profiles: { name: string } | null;
};

type Props = { searchParams: Promise<{ cat?: string }> };

const CATEGORIES = ["All", "Markets", "Tax & Legal", "Running a Business", "Finance", "Technology", "Other"];

export default async function KnowledgePage({ searchParams }: Props) {
  const actor = await resolveActor();
  const { cat } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  let query = db
    .from("knowledge_posts")
    .select("id, url, title, description, preview_image, category, source, author_id, created_at, profiles(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(40);

  if (cat && cat !== "All") {
    query = query.eq("category", cat);
  }

  const { data: posts } = await query as { data: PostRow[] | null };

  // Fetch helpful counts + which ones the current user has reacted to
  const postIds = (posts ?? []).map(p => p.id);
  const helpfulCounts: Record<string, number> = {};
  const myHelpful = new Set<string>();

  if (postIds.length > 0) {
    const { data: reactions } = await db
      .from("knowledge_reactions")
      .select("post_id, profile_id")
      .in("post_id", postIds)
      .eq("type", "helpful") as { data: { post_id: string; profile_id: string }[] | null };
    for (const r of reactions ?? []) {
      helpfulCounts[r.post_id] = (helpfulCounts[r.post_id] ?? 0) + 1;
      if (r.profile_id === actor.id) myHelpful.add(r.post_id);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-bold text-2xl text-[#15201E]">Knowledge</h1>
        <Link
          href="/community/knowledge/submit"
          className="h-9 px-4 rounded-xl text-sm font-medium text-white flex items-center"
          style={{ background: "#0B5D63" }}
        >
          + Share
        </Link>
      </div>
      <p className="text-sm text-[#4F5B59] mb-5">Articles, guides and resources shared by members.</p>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
        {CATEGORIES.map(c => (
          <Link
            key={c}
            href={c === "All" ? "/community/knowledge" : `/community/knowledge?cat=${encodeURIComponent(c)}`}
            className="shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors"
            style={{
              background: (cat === c || (!cat && c === "All")) ? "#0B5D63" : "#fff",
              color: (cat === c || (!cat && c === "All")) ? "#fff" : "#4F5B59",
              border: "1px solid #E5E7E6",
            }}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Posts */}
      {(posts ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">📚</p>
          <p className="text-sm text-[#4F5B59]">No posts yet in this category.</p>
          <Link href="/community/knowledge/submit" className="text-sm text-[#0B5D63] mt-2 inline-block">
            Be the first to share →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(posts ?? []).map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#E5E7E6] overflow-hidden">
              <Link
                href={`/community/knowledge/${p.id}`}
                className="flex gap-3 p-4 hover:bg-[#F6F7F5] transition-colors"
              >
                {p.preview_image && (
                  <img
                    src={p.preview_image}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0B5D63]">{p.category}</span>
                  <p className="font-semibold text-sm text-[#15201E] leading-snug mt-0.5 line-clamp-2">{p.title}</p>
                  {p.description && (
                    <p className="text-xs text-[#4F5B59] mt-0.5 line-clamp-1">{p.description}</p>
                  )}
                  <p className="text-xs text-[#4F5B59] mt-1">
                    Shared by {(p.profiles as { name: string } | null)?.name ?? "a member"} ·{" "}
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-3 flex items-center gap-3 border-t border-[#F0F0EE]">
                <HelpfulButton
                  postId={p.id}
                  count={helpfulCounts[p.id] ?? 0}
                  isActive={myHelpful.has(p.id)}
                />
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#4F5B59] hover:text-[#0B5D63] ml-auto"
                >
                  Open link ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
