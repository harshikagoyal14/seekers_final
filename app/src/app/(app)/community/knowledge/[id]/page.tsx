import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (svc as any).from("knowledge_posts").select("title").eq("id", id).single();
  return { title: data?.title ?? "Knowledge" };
}

export default async function KnowledgeDetailPage({ params }: Props) {
  await resolveActor();
  const { id } = await params;

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: post } = await db
    .from("knowledge_posts")
    .select("id, url, title, description, preview_image, category, source, created_at, profiles(id, name, designation, company, photo_url)")
    .eq("id", id)
    .eq("status", "approved")
    .single() as {
      data: {
        id: string; url: string; title: string; description: string | null;
        preview_image: string | null; category: string; source: string; created_at: string;
        profiles: { id: string; name: string; designation: string | null; company: string | null; photo_url: string | null } | null;
      } | null
    };

  if (!post) notFound();

  const author = post.profiles;
  const authorInitials = author?.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/community/knowledge" className="text-sm text-[#4F5B59] hover:text-[#0B5D63] mb-6 inline-block">
        ← Knowledge
      </Link>

      {post.preview_image && (
        <img
          src={post.preview_image}
          alt=""
          className="w-full h-48 object-cover rounded-2xl mb-5"
        />
      )}

      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0B5D63]">{post.category}</span>
      <h1 className="font-bold text-2xl text-[#15201E] mt-1 mb-3 leading-snug">{post.title}</h1>

      {post.description && (
        <p className="text-[#4F5B59] mb-5 leading-relaxed">{post.description}</p>
      )}

      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-medium mb-8"
        style={{ background: "#0B5D63" }}
      >
        Read article →
      </a>

      {/* Author card */}
      {author && (
        <div className="border-t border-[#E5E7E6] pt-5">
          <p className="text-xs text-[#4F5B59] mb-3 uppercase tracking-wide font-semibold">Shared by</p>
          <Link
            href={`/members/${author.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden"
              style={{ background: "#0B5D63" }}
            >
              {author.photo_url
                ? <img src={author.photo_url} alt={author.name} className="w-full h-full object-cover" />
                : authorInitials}
            </div>
            <div>
              <p className="font-medium text-sm text-[#15201E]">{author.name}</p>
              {(author.designation || author.company) && (
                <p className="text-xs text-[#4F5B59]">
                  {[author.designation, author.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </Link>
        </div>
      )}

      <p className="text-xs text-[#4F5B59] mt-5">
        {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {post.source && ` · ${post.source}`}
      </p>
    </div>
  );
}
