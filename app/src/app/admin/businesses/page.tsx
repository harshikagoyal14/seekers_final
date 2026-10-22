import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import AdminBusinessActions from "./admin-business-actions";

export const metadata: Metadata = { title: "Admin · Businesses" };

type BizRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  approval_status: string;
  created_at: string;
  profiles: { name: string; location: string | null } | null;
  categories: { name: string } | null;
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminBusinessesPage({ searchParams }: Props) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: businesses } = await db
    .from("business_profiles")
    .select("id, name, slug, type, approval_status, created_at, profiles(name, location), categories(name)")
    .eq("approval_status", status)
    .order("created_at", { ascending: true })
    .limit(50) as { data: BizRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-bold text-xl text-[#15201E] mb-4">Businesses</h1>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected"].map(s => (
          <a
            key={s}
            href={`/admin/businesses?status=${s}`}
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

      {(businesses ?? []).length === 0 ? (
        <p className="text-sm text-[#4F5B59]">No businesses with status "{status}".</p>
      ) : (
        <div className="space-y-3">
          {(businesses ?? []).map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-[#E5E7E6]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#15201E]">{b.name}</p>
                  <p className="text-xs text-[#4F5B59] mt-0.5">
                    {(b.profiles as { name: string } | null)?.name} ·{" "}
                    {b.categories?.name ?? b.type} ·{" "}
                    {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <a
                    href={`/business/${b.slug}`}
                    target="_blank"
                    className="text-xs text-[#0B5D63] mt-0.5 inline-block"
                  >
                    View public page ↗
                  </a>
                </div>
                {status === "pending" && <AdminBusinessActions id={b.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
