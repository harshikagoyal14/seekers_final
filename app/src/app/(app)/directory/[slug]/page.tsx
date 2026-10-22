import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReferBusinessButton from "./refer-business-button";

type Props = { params: Promise<{ slug: string }> };

type BusinessRow = {
  id: string; name: string; slug: string; type: string;
  bio: string | null; logo_path: string | null;
  location: string | null; years: number | null;
  referral_fee_pct: number;
  categories: { name: string } | null;
  profiles: { name: string } | null;
};

type CatalogueRow = {
  id: string; title: string; description: string | null;
  price_paise: number | null; price_label: string | null;
};

type ReviewRow = {
  id: string; rating: number | null; text: string;
  reply: string | null; profiles: unknown; created_at: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function DirectoryBusinessPage({ params }: Props) {
  const { slug } = await params;
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: b } = await db
    .from("business_profiles")
    .select("id, name, slug, type, bio, logo_path, location, years, referral_fee_pct, categories(name), profiles!business_profiles_owner_id_fkey(name)")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .single() as { data: BusinessRow | null };

  if (!b) notFound();

  const isOwner = b.profiles != null &&
    (b.profiles as { name: string }).name === actor.name;

  const [{ data: catalogue }, { data: badges }, { data: reviews }] = await Promise.all([
    db.from("catalogue_items")
      .select("id, title, description, price_paise, price_label")
      .eq("business_id", b.id).eq("hidden", false).order("position"),
    db.from("badges").select("type").eq("business_id", b.id).is("revoked_at", null),
    db.from("reviews")
      .select("id, rating, text, reply, profiles(name, location), created_at")
      .eq("business_id", b.id).eq("status", "approved").order("created_at", { ascending: false }),
  ]);

  const verified = (reviews as ReviewRow[] ?? []).filter((r) => r.rating != null);
  const avgRating = verified.length >= 3
    ? verified.reduce((s, r) => s + (r.rating ?? 0), 0) / verified.length
    : null;
  const hasBadge = (badges ?? []).length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
      {/* Left */}
      <div>
        {/* Back */}
        <Link href="/directory" className="text-sm text-[#4F5B59] mb-4 inline-block">← Directory</Link>

        {/* Hero card */}
        <div className="bg-white rounded-2xl p-6 mb-5 border border-[#E5E7E6]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden"
              style={{ background: "#0B5D63" }}>
              {b.logo_path
                ? <img src={b.logo_path} alt={b.name} className="w-full h-full object-cover" />
                : b.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl text-[#15201E] leading-tight">{b.name}</h1>
              <p className="text-sm text-[#4F5B59] mt-0.5">
                {b.categories?.name ?? b.type}
                {b.location && ` · ${b.location}`}
              </p>
              {hasBadge && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#0B5D63" />
                    <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-semibold text-[#0B5D63]">Verified business</span>
                </div>
              )}
              {avgRating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm">★</span>
                  <span className="text-sm font-semibold text-[#15201E]">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-[#4F5B59]">({verified.length} reviews)</span>
                </div>
              )}
              {b.years && (
                <p className="text-xs text-[#4F5B59] mt-1">In business since {new Date().getFullYear() - b.years}</p>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {b.bio && (
          <section className="mb-5">
            <h2 className="font-semibold text-sm text-[#15201E] mb-2">About</h2>
            <p className="text-sm text-[#15201E] leading-relaxed whitespace-pre-line">{b.bio}</p>
          </section>
        )}

        {/* Catalogue */}
        {(catalogue ?? []).length > 0 && (
          <section className="mb-5">
            <h2 className="font-semibold text-sm text-[#15201E] mb-3">Catalogue</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(catalogue as CatalogueRow[]).map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 border border-[#E5E7E6]">
                  <p className="font-medium text-sm text-[#15201E]">{item.title}</p>
                  {item.description && <p className="text-xs text-[#4F5B59] mt-0.5">{item.description}</p>}
                  <p className="text-xs font-medium text-[#0B5D63] mt-2">
                    {item.price_paise
                      ? "₹" + (item.price_paise / 100).toLocaleString("en-IN")
                      : item.price_label ?? "Price on enquiry"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {verified.length > 0 && (
          <section className="mb-5">
            <h2 className="font-semibold text-sm text-[#15201E] mb-3">Reviews</h2>
            <div className="space-y-3">
              {verified.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white rounded-xl p-4 border border-[#E5E7E6]">
                  {r.rating && <div className="text-sm mb-1">{"★".repeat(r.rating)}</div>}
                  <p className="text-sm text-[#15201E]">"{r.text}"</p>
                  <p className="text-xs text-[#4F5B59] mt-1">
                    {(r.profiles as { name: string } | null)?.name ?? "Member"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  {r.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-[#0B5D63]">
                      <p className="text-xs text-[#4F5B59]"><strong>{b.name}:</strong> {r.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right — sticky CTA */}
      <div className="mt-6 lg:mt-0">
        <div className="lg:sticky lg:top-6 space-y-3">
          {/* Refer CTA — only if not owner */}
          {!isOwner && (
            <ReferBusinessButton
              businessId={b.id}
              businessName={b.name}
              referralFeePct={b.referral_fee_pct}
            />
          )}

          {/* Enquire CTA */}
          <a
            href={`/business/${b.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-2xl border border-[#0B5D63] text-sm font-semibold text-[#0B5D63]"
          >
            Send an enquiry ↗
          </a>

          {isOwner && (
            <Link
              href="/my-business/edit"
              className="block w-full text-center py-3 rounded-2xl border border-[#E5E7E6] text-sm text-[#4F5B59]"
            >
              Edit your listing →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
