"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminKnowledgeActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="h-8 px-3 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
        style={{ background: "#17663A" }}
      >
        {loading === "approve" ? "…" : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={!!loading}
        className="h-8 px-3 rounded-xl text-xs font-semibold border border-red-300 text-red-600 disabled:opacity-60"
      >
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
