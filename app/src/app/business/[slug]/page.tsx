import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnquiryForm from "./enquiry-form";
import ScrollToEnquiryButton from "./scroll-to-enquiry-button";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: b } = await (svc as any)
    .from("business_profiles")
    .select("name, bio, logo_path, category_id, categories(name)")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .single() as { data: Pick<BusinessRow, "name" | "bio" | "logo_path"> & { categories: { name: string } | null } | null };

  if (!b) return { title: "Business not found" };
  const business = b;

  const description = business.bio?.slice(0, 80) ?? "A verified business on Seekers Community.";
  return {
    title: business.name,
    description,
    openGraph: {
      title: business.name + " · Verified on Seekers",
      description,
      type: "website",
    },
  };
}

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  bio: string | null;
  logo_path: string | null;
  location: string | null;
  years: number | null;
  category_id: string | null;
  categories: { name: string } | null;
  owner_id: string;
  profiles: { name: string } | null;
};

export default async function PublicBusinessPage({ params }: Props) {
  const { slug } = await params;
  const svc = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svcDb = svc as any;

  // Redirect old slugs
  const { data: history } = await svcDb
    .from("slug_history")
    .select("business_id, business_profiles(slug)")
    .eq("old_slug", slug)
    .single() as { data: { business_profiles: { slug: string } | null } | null };
  if (history) {
    const bp = history.business_profiles;
    if (bp?.slug) {
      const { redirect } = await import("next/navigation");
      redirect(`/business/${bp.slug}`);
    }
  }

  const { data: b } = await svcDb
    .from("business_profiles")
    .select("id, name, slug, type, bio, logo_path, location, years, category_id, categories(name), owner_id, profiles!business_profiles_owner_id_fkey(name)")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .single() as { data: BusinessRow | null };

  if (!b) notFound();
  const business = b;

  // Catalogue items
  const { data: catalogue } = await svcDb
    .from("catalogue_items")
    .select("id, title, description, price_paise, price_label")
    .eq("business_id", business.id)
    .eq("hidden", false)
    .order("position") as { data: CatalogueRow[] | null };

  // Badges
  const { data: badges } = await svcDb
    .from("badges")
    .select("type, granted_at")
    .eq("business_id", business.id)
    .is("revoked_at", null) as { data: Array<{ type: string; granted_at: string }> | null };

  // Reviews (approved only, verified type only for rating)
  const { data: reviews } = await svcDb
    .from("reviews")
    .select("id, type, rating, text, reply, author_profile_id, profiles(name, location), created_at")
    .eq("business_id", business.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false }) as { data: ReviewRow[] | null };

  const verifiedReviews = (reviews ?? []).filter((r: unknown) => (r as { type: string }).type === "verified");
  const avgRating = verifiedReviews.length >= 3
    ? verifiedReviews.reduce((s: number, r: unknown) => s + ((r as { rating: number | null }).rating ?? 0), 0) / verifiedReviews.length
    : null;

  const hasBadge = (badges ?? []).length > 0;

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      {/* Public slim header */}
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#083F43]">
          Seekers<span className="text-[#0B5D63]">.</span>
          <span className="ml-2 text-xs font-normal text-[#4F5B59]">A closed community in India</span>
        </Link>
        <Link href="/auth/sign-in" className="text-sm font-medium text-[#0B5D63]">Member sign in</Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Left: business info */}
        <div>
          {/* Visiting card hero */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-[#E5E7E6]">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
                style={{ background: "#0B5D63" }}>
                {business.logo_path
                  ? <img src={business.logo_path} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                  : business.name.slice(0, 2).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-2xl text-[#15201E] leading-tight">{business.name}</h1>
                <p className="text-sm text-[#4F5B59] mt-0.5">
                  {business.categories?.name ?? business.type}
                  {business.location && ` · ${business.location}`}
                </p>

                {hasBadge && (
                  <div className="flex items-center gap-1.5 mt-2">
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
                    <span className="text-xs text-[#4F5B59]">from {verifiedReviews.length} reviews</span>
                  </div>
                )}

                {business.years && (
                  <p className="text-xs text-[#4F5B59] mt-1">In business since {new Date().getFullYear() - business.years}</p>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          {business.bio && (
            <section className="mb-6">
              <h2 className="font-semibold text-base text-[#15201E] mb-2">About</h2>
              <p className="text-sm text-[#15201E] leading-relaxed whitespace-pre-line">{business.bio}</p>
            </section>
          )}

          {/* Catalogue */}
          {catalogue && catalogue.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base text-[#15201E]">Catalogue</h2>
                <span className="text-xs text-[#4F5B59]">{catalogue.length} items</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {(catalogue as unknown as CatalogueRow[]).map((item) => (
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
          {verifiedReviews.length > 0 && (
            <section className="mb-6">
              <h2 className="font-semibold text-base text-[#15201E] mb-3">What clients say</h2>
              <p className="text-xs text-[#4F5B59] mb-3">Only members whose referral or enquiry closed with this business can leave a review.</p>
              <div className="space-y-3">
                {(verifiedReviews as unknown as ReviewRow[]).slice(0, 5).map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-4 border border-[#E5E7E6]">
                    {r.rating && (
                      <div className="text-sm mb-1">{"★".repeat(r.rating)}<span className="text-[#E5E7E6]">{"★".repeat(5 - r.rating)}</span></div>
                    )}
                    <p className="text-sm text-[#15201E]">"{r.text}"</p>
                    <p className="text-xs text-[#4F5B59] mt-1">
                      {(r.profiles as { name: string } | null)?.name ?? "Member"}
                      {(r.profiles as { location: string | null } | null)?.location && ` · ${(r.profiles as { location: string | null }).location}`}
                    </p>
                    {r.reply && (
                      <div className="mt-2 pl-3 border-l-2 border-[#0B5D63]">
                        <p className="text-xs text-[#4F5B59]"><strong>{business.name}:</strong> {r.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seekers footer */}
          <div className="border rounded-xl p-4 border-[#E5E7E6] text-center">
            <p className="text-xs text-[#4F5B59]">
              Seekers is a closed community of business owners, freelancers and investors. Membership is by invitation.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/about" className="text-xs text-[#0B5D63]">About Seekers</Link>
              <Link href="/wealth-seekers" className="text-xs text-[#0B5D63]">Wealth Seekers</Link>
              <Link href="/faq" className="text-xs text-[#0B5D63]">Help</Link>
            </div>
          </div>
        </div>

        {/* Right: enquiry form (sticky on desktop) */}
        <div className="mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-6">
            <EnquiryForm businessId={business.id} businessName={business.name} />
          </div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-white border-t border-[#E5E7E6] flex gap-3">
        <ScrollToEnquiryButton />
      </div>
    </div>
  );
}

type CatalogueRow = { id: string; title: string; description: string | null; price_paise: number | null; price_label: string | null };
type ReviewRow = { id: string; type: string; rating: number | null; text: string; reply: string | null; author_profile_id: string | null; profiles: unknown; created_at: string };
