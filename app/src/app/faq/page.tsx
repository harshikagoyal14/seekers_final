import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import FaqSearch from "./faq-search";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers about how Seekers works — referrals, credits, businesses, privacy.",
};

export default async function FaqPage() {
  const svc = await createServiceClient();
  const { data: items } = await svc
    .from("faq_items")
    .select("id, question, answer, topic")
    .order("topic")
    .order("position");

  const faqItems = (items as FaqRow[] | null) ?? [];

  // Group by topic
  const grouped: Record<string, FaqRow[]> = {};
  for (const item of faqItems) {
    if (!grouped[item.topic]) grouped[item.topic] = [];
    grouped[item.topic].push(item);
  }

  // Structured data for search engines
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#083F43]">Seekers<span className="text-[#0B5D63]">.</span></Link>
        <Link href="/auth/sign-in" className="text-sm font-medium text-[#0B5D63]">Member sign in</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-bold text-3xl text-[#083F43] mb-2">Help & FAQ</h1>
        <p className="text-[#4F5B59] mb-8">Find answers about how Seekers works.</p>

        <FaqSearch items={faqItems} grouped={grouped} />

        {/* Still stuck */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-[#E5E7E6]">
          <h2 className="font-semibold text-base text-[#15201E] mb-1">Still stuck?</h2>
          <p className="text-sm text-[#4F5B59] mb-4">Send us a message and we'll get back to you.</p>
          <SupportForm />
        </div>
      </main>
    </div>
  );
}

type FaqRow = { id: string; question: string; answer: string; topic: string };

function SupportForm() {
  // Client component — inline for simplicity
  return (
    <form action="/api/support" method="POST" className="space-y-3">
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Describe your question…"
        className="w-full rounded-xl border border-[#D1D5D4] px-4 py-3 text-sm text-[#15201E] focus:outline-none focus:ring-2 focus:ring-[#0B5D63]"
      />
      <button
        type="submit"
        className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-[#0B5D63]"
      >
        Send message
      </button>
    </form>
  );
}
