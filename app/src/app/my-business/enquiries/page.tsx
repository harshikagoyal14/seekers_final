import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Enquiries" };

type EnquiryRow = {
  id: string;
  name: string;
  message: string;
  status: string;
  became_customer: boolean;
  created_at: string;
  sender_profile_id: string | null;
  profiles: { name: string } | null;
};

export default async function EnquiriesPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: biz } = await db
    .from("business_profiles")
    .select("id, name")
    .eq("owner_id", actor.id)
    .single() as { data: { id: string; name: string } | null };

  if (!biz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#4F5B59] mb-4">You don&apos;t have a business listing yet.</p>
        <Link href="/my-business/edit" className="text-sm text-[#0B5D63]">List your business →</Link>
      </div>
    );
  }

  const { data: enquiries } = await db
    .from("enquiries")
    .select("id, name, message, status, became_customer, created_at, sender_profile_id, profiles(name)")
    .eq("business_id", biz.id)
    .order("created_at", { ascending: false })
    .limit(50) as { data: EnquiryRow[] | null };

  const list = enquiries ?? [];
  const newCount = list.filter(e => e.status === "new").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-xl text-[#15201E]">Enquiries</h1>
          <p className="text-sm text-[#4F5B59]">{biz.name}</p>
        </div>
        {newCount > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: "#0B5D63" }}>
            {newCount} new
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">📥</p>
          <p className="text-sm text-[#4F5B59]">No enquiries yet. Share your business page to get started.</p>
          <Link href={`/business/${biz.id}`} className="text-sm text-[#0B5D63] mt-2 inline-block">
            View public page →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(e => (
            <div
              key={e.id}
              className={`bg-white rounded-2xl p-4 border transition-colors ${e.status === "new" ? "border-[#0B5D63]" : "border-[#E5E7E6]"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[#15201E]">
                    {(e.profiles as { name: string } | null)?.name ?? e.name}
                  </p>
                  <p className="text-xs text-[#4F5B59]">
                    {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {e.status === "new" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0B5D63] text-white font-medium">New</span>
                  )}
                  {e.became_customer && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Customer</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#15201E] leading-relaxed">{e.message}</p>
              {!e.became_customer && (
                <form action="/api/enquiries/mark-customer" method="POST" className="mt-3">
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    className="text-xs text-[#0B5D63] font-medium border border-[#0B5D63] px-3 py-1 rounded-lg"
                  >
                    Mark as customer
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
