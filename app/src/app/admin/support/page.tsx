import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin · Support" };

type TicketRow = {
  id: string;
  email: string | null;
  message: string;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminSupportPage({ searchParams }: Props) {
  await requireAdmin();
  const { status = "open" } = await searchParams;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: tickets } = await db
    .from("support_tickets")
    .select("id, email, message, status, created_at, profiles(name)")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(50) as { data: TicketRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin" className="text-sm text-[#4F5B59]">← Admin</Link>
        <h1 className="font-bold text-xl text-[#15201E]">Support Tickets</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["open","resolved"].map(s => (
          <Link
            key={s}
            href={`/admin/support?status=${s}`}
            className="h-9 px-4 rounded-xl text-sm font-medium capitalize"
            style={status === s
              ? { background: "#0B5D63", color: "#fff" }
              : { background: "#F6F7F5", color: "#4F5B59" }}
          >
            {s}
          </Link>
        ))}
      </div>

      {(tickets ?? []).length === 0 ? (
        <p className="text-sm text-[#4F5B59]">No {status} tickets.</p>
      ) : (
        <div className="space-y-3">
          {(tickets ?? []).map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-[#E5E7E6]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[#15201E]">
                    {t.profiles?.name ?? t.email ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-[#4F5B59]">
                    {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === "open" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-[#15201E] whitespace-pre-wrap">{t.message}</p>
              {t.status === "open" && (
                <form action="/api/admin/support" method="POST" className="mt-3">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-xl text-xs font-medium text-white"
                    style={{ background: "#0B5D63" }}
                  >
                    Mark resolved
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
