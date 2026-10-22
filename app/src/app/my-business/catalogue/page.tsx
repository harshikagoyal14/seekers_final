import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import CatalogueClient from "./catalogue-client";

export const metadata: Metadata = { title: "Catalogue" };

type CatalogueItem = {
  id: string;
  title: string;
  description: string | null;
  price_paise: number | null;
  price_label: string | null;
  position: number;
  hidden: boolean;
};

export default async function CataloguePage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: biz } = await db
    .from("business_profiles")
    .select("id, name, approval_status")
    .eq("owner_id", actor.id)
    .single() as { data: { id: string; name: string; approval_status: string } | null };

  if (!biz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#4F5B59] mb-4">You don&apos;t have a business listing yet.</p>
        <Link href="/my-business/edit" className="text-sm text-[#0B5D63]">List your business →</Link>
      </div>
    );
  }

  const { data: items } = await db
    .from("catalogue_items")
    .select("id, title, description, price_paise, price_label, position, hidden")
    .eq("business_id", biz.id)
    .order("position") as { data: CatalogueItem[] | null };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-xl text-[#15201E]">Catalogue</h1>
          <p className="text-sm text-[#4F5B59]">{biz.name}</p>
        </div>
      </div>

      <CatalogueClient businessId={biz.id} items={items ?? []} />
    </div>
  );
}
