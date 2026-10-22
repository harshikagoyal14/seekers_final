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
  const { data } = await (svc as any).from("profiles").select("name").eq("id", id).single();
  return { title: data?.name ?? "Member" };
}

export default async function MemberProfilePage({ params }: Props) {
  await resolveActor();
  const { id } = await params;

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: member } = await db
    .from("profiles")
    .select("id, name, designation, company, location, industry, bio, photo_url, directory_visible, created_at")
    .eq("id", id)
    .single() as {
      data: {
        id: string; name: string; designation: string | null; company: string | null;
        location: string | null; industry: string | null; bio: string | null;
        photo_url: string | null; directory_visible: boolean; created_at: string;
      } | null
    };

  if (!member || !member.directory_visible) notFound();

  // Their business listing if any
  const { data: biz } = await db
    .from("business_profiles")
    .select("id, name, slug, type, bio")
    .eq("owner_id", id)
    .eq("approval_status", "approved")
    .maybeSingle() as { data: { id: string; name: string; slug: string; type: string; bio: string | null } | null };

  const initials = member.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href="/members" className="text-sm text-[#4F5B59] hover:text-[#0B5D63] mb-6 inline-block">
        ← Members
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-[#E5E7E6] p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden"
            style={{ background: "#0B5D63" }}
          >
            {member.photo_url
              ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#15201E]">{member.name}</h1>
            {(member.designation || member.company) && (
              <p className="text-sm text-[#4F5B59] mt-0.5">
                {[member.designation, member.company].filter(Boolean).join(" · ")}
              </p>
            )}
            {member.location && (
              <p className="text-xs text-[#4F5B59] mt-0.5">{member.location}</p>
            )}
          </div>
        </div>

        {member.industry && (
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#F6F7F5] text-[#4F5B59] mb-3">
            {member.industry}
          </span>
        )}

        {member.bio && (
          <p className="text-sm text-[#15201E] leading-relaxed">{member.bio}</p>
        )}

        <p className="text-xs text-[#4F5B59] mt-4">
          Member since {new Date(member.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Business listing */}
      {biz && (
        <div className="bg-white rounded-2xl border border-[#E5E7E6] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4F5B59] mb-3">Business</p>
          <p className="font-semibold text-[#15201E]">{biz.name}</p>
          {biz.bio && <p className="text-sm text-[#4F5B59] mt-1 line-clamp-2">{biz.bio}</p>}
          <Link
            href={`/directory/${biz.slug}`}
            className="inline-block mt-3 text-sm text-[#0B5D63] font-medium hover:underline"
          >
            View listing →
          </Link>
        </div>
      )}
    </div>
  );
}
