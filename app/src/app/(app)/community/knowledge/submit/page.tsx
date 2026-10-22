"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Markets", "Tax & Legal", "Running a Business", "Finance", "Technology", "Other"];

export default function KnowledgeSubmitPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !title.trim() || !category) {
      setError("URL, title and category are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title, description, category }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to submit.");
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">✓</p>
        <h2 className="font-bold text-xl text-[#15201E] mb-2">Submitted for review</h2>
        <p className="text-sm text-[#4F5B59] mb-6">The team will review and publish it shortly.</p>
        <button
          onClick={() => router.push("/community/knowledge")}
          className="h-11 px-6 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#0B5D63" }}
        >
          Back to Knowledge
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#4F5B59] text-sm">← Back</button>
        <h1 className="font-bold text-xl text-[#15201E]">Share an article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">URL *</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
            placeholder="https://…"
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Article headline"
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Why is this useful? (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="1–2 sentences on why members should read this"
            className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#15201E] mb-1">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] bg-white"
          >
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
          style={{ background: "#0B5D63" }}
        >
          {saving ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
