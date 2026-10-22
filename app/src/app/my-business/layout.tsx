import { resolveActor } from "@/lib/server/auth";
import Link from "next/link";
import MyBusinessNav from "./my-business-nav";

export default async function MyBusinessLayout({ children }: { children: React.ReactNode }) {
  await resolveActor();
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center gap-4">
        <Link href="/me" className="text-[#4F5B59] text-sm">← Back</Link>
        <span className="font-semibold text-sm text-[#15201E]">My Business</span>
      </header>
      <MyBusinessNav />
      <main>{children}</main>
    </div>
  );
}
