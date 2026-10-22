import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import BusinessEditForm from "./business-edit-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Business Listing" };

type Category = { id: string; name: string; referral_fee_allowed: boolean };
type BusinessRow = {
  id: string; name: string; type: string; category_id: string | null;
  bio: string | null; location: string | null; years: number | null;
  website: string | null; instagram: string | null; linkedin: string | null;
  referral_fee_pct: number; approval_status: string; logo_path: string | null;
};

export default async function MyBusinessEditPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: categories } = await db
    .from("categories")
    .select("id, name, referral_fee_allowed")
    .order("name") as { data: Category[] | null };

  const { data: business } = await db
    .from("business_profiles")
    .select("id, name, type, category_id, bio, location, years, website, instagram, linkedin, referral_fee_pct, approval_status, logo_path")
    .eq("owner_id", actor.id)
    .maybeSingle() as { data: BusinessRow | null };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-bold text-xl text-[#15201E] mb-1">
        {business ? "Edit Business Listing" : "List Your Business"}
      </h1>
      <p className="text-sm text-[#4F5B59] mb-6">
        {business
          ? "Changes go back to admin for review. Your public page stays live while pending."
          : "Your listing will be reviewed by an admin before going public. Usually within 24 hours."}
      </p>

      <BusinessEditForm
        categories={categories ?? []}
        existing={business}
      />
    </div>
  );
}
