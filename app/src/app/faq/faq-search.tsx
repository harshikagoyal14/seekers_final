"use client";
import { useState } from "react";

type FaqRow = { id: string; question: string; answer: string; topic: string };

export default function FaqSearch({ items, grouped }: { items: FaqRow[]; grouped: Record<string, FaqRow[]> }) {
  const [query,  setQuery]  = useState("");
  const [open,   setOpen]   = useState<string | null>(null);

  const results = query.trim()
    ? items.filter(f =>
        f.question.toLowerCase().includes(query.toLowerCase()) ||
        f.answer.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search FAQ…"
        className="w-full h-12 rounded-xl border border-[#D1D5D4] px-4 text-base text-[#15201E] mb-6 focus:outline-none focus:ring-2 focus:ring-[#0B5D63]"
      />

      {results !== null ? (
        results.length === 0 ? (
          <p className="text-sm text-[#4F5B59]">No results for "{query}".</p>
        ) : (
          <div className="space-y-3">
            {results.map(f => <FaqItem key={f.id} item={f} open={open} setOpen={setOpen} />)}
          </div>
        )
      ) : (
        Object.entries(grouped).map(([topic, faqItems]) => (
          <div key={topic} className="mb-8">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#4F5B59] mb-3">{topic}</h2>
            <div className="space-y-2">
              {faqItems.map(f => <FaqItem key={f.id} item={f} open={open} setOpen={setOpen} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FaqItem({ item, open, setOpen }: { item: FaqRow; open: string | null; setOpen: (id: string | null) => void }) {
  const isOpen = open === item.id;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7E6] overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 font-medium text-sm text-[#15201E]"
        onClick={() => setOpen(isOpen ? null : item.id)}
        aria-expanded={isOpen}
      >
        {item.question}
        <span className="shrink-0 text-[#0B5D63]">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-[#4F5B59] leading-relaxed border-t border-[#E5E7E6] pt-3 whitespace-pre-line">
          {item.answer}
        </div>
      )}
    </div>
  );
}
