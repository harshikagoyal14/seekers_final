import { resolveActor } from "@/lib/server/auth";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage() {
  await resolveActor();
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-bold text-2xl text-[#15201E] mb-1">Community</h1>
      <p className="text-sm text-[#4F5B59] mb-6">Events, knowledge and everything happening in Seekers.</p>

      <div className="space-y-3">
        <Link
          href="/community/events"
          className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#E5E7E6] hover:border-[#0B5D63] transition-colors"
        >
          <span className="text-3xl">📅</span>
          <div>
            <p className="font-semibold text-sm text-[#15201E]">Events &amp; Initiatives</p>
            <p className="text-xs text-[#4F5B59] mt-0.5">Curated events, meetups and community initiatives.</p>
          </div>
          <span className="ml-auto text-[#4F5B59]">›</span>
        </Link>

        <Link
          href="/community/knowledge"
          className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#E5E7E6] hover:border-[#0B5D63] transition-colors"
        >
          <span className="text-3xl">📚</span>
          <div>
            <p className="font-semibold text-sm text-[#15201E]">Knowledge</p>
            <p className="text-xs text-[#4F5B59] mt-0.5">Articles, guides and resources shared by members.</p>
          </div>
          <span className="ml-auto text-[#4F5B59]">›</span>
        </Link>
      </div>
    </div>
  );
}
