import { requireAdmin } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  await requireAdmin();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const [
    { count: totalMembers },
    { count: pendingBiz },
    { count: approvedBiz },
    { count: pendingKnowledge },
    { count: totalReferrals },
    { count: openTickets },
    { count: pendingReviews },
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("business_profiles").select("id", { count: "exact", head: true }).eq("approval_status", "pending"),
    db.from("business_profiles").select("id", { count: "exact", head: true }).eq("approval_status", "approved"),
    db.from("knowledge_posts").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("referrals").select("id", { count: "exact", head: true }),
    db.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total members",        value: totalMembers ?? 0 },
    { label: "Approved businesses",  value: approvedBiz ?? 0 },
    { label: "Pending approvals",    value: pendingBiz ?? 0, highlight: (pendingBiz ?? 0) > 0 },
    { label: "Knowledge (pending)",  value: pendingKnowledge ?? 0, highlight: (pendingKnowledge ?? 0) > 0 },
    { label: "Total referrals",      value: totalReferrals ?? 0 },
    { label: "Open tickets",         value: openTickets ?? 0, highlight: (openTickets ?? 0) > 0 },
    { label: "Reviews (pending)",    value: pendingReviews ?? 0, highlight: (pendingReviews ?? 0) > 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-bold text-xl text-[#15201E] mb-6">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: s.highlight ? "#0B5D63" : "#E5E7E6" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.highlight ? "#0B5D63" : "#15201E" }}>{s.value}</p>
            <p className="text-xs text-[#4F5B59] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {(pendingBiz ?? 0) > 0 && (
          <a href="/admin/businesses" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0B5D63]">
            <p className="text-sm font-medium text-[#15201E]">{pendingBiz} business{(pendingBiz ?? 0) > 1 ? "es" : ""} waiting for approval</p>
            <span className="text-xs text-[#0B5D63]">Review →</span>
          </a>
        )}
        {(pendingKnowledge ?? 0) > 0 && (
          <a href="/admin/knowledge" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0B5D63]">
            <p className="text-sm font-medium text-[#15201E]">{pendingKnowledge} knowledge post{(pendingKnowledge ?? 0) > 1 ? "s" : ""} pending review</p>
            <span className="text-xs text-[#0B5D63]">Review →</span>
          </a>
        )}
        {(openTickets ?? 0) > 0 && (
          <a href="/admin/support" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0B5D63]">
            <p className="text-sm font-medium text-[#15201E]">{openTickets} open support ticket{(openTickets ?? 0) > 1 ? "s" : ""}</p>
            <span className="text-xs text-[#0B5D63]">View →</span>
          </a>
        )}
        {(pendingReviews ?? 0) > 0 && (
          <a href="/admin/reviews" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0B5D63]">
            <p className="text-sm font-medium text-[#15201E]">{pendingReviews} review{(pendingReviews ?? 0) > 1 ? "s" : ""} pending moderation</p>
            <span className="text-xs text-[#0B5D63]">Review →</span>
          </a>
        )}
        <a href="/admin/support" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E5E7E6]">
          <p className="text-sm font-medium text-[#15201E]">Support tickets</p>
          <span className="text-xs text-[#4F5B59]">View all →</span>
        </a>
        <a href="/admin/reviews" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E5E7E6]">
          <p className="text-sm font-medium text-[#15201E]">Reviews</p>
          <span className="text-xs text-[#4F5B59]">View all →</span>
        </a>
        <a href="/admin/wealth-seekers" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E5E7E6]">
          <p className="text-sm font-medium text-[#15201E]">Wealth Seekers applications</p>
          <span className="text-xs text-[#4F5B59]">View →</span>
        </a>
      </div>
    </div>
  );
}
