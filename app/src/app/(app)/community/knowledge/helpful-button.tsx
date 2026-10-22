"use client";
import { useState } from "react";

export default function HelpfulButton({
  postId,
  count: initialCount,
  isActive: initialActive,
}: {
  postId: string;
  count: number;
  isActive: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    // Optimistic update
    setActive(a => !a);
    setCount(c => active ? c - 1 : c + 1);

    const res = await fetch("/api/knowledge/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, type: "helpful" }),
    });

    if (!res.ok) {
      // Revert on failure
      setActive(a => !a);
      setCount(c => active ? c + 1 : c - 1);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors py-1.5 rounded-lg disabled:opacity-60"
      style={{ color: active ? "#0B5D63" : "#4F5B59" }}
    >
      <span>{active ? "👍" : "👍"}</span>
      <span style={{ color: active ? "#0B5D63" : "#9AA4A2" }}>Helpful</span>
      {count > 0 && (
        <span
          className="font-semibold"
          style={{ color: active ? "#0B5D63" : "#4F5B59" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
