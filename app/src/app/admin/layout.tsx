import { requireAdmin } from "@/lib/server/auth";
import Link from "next/link";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-[#4F5B59] text-sm">← App</Link>
          <span className="font-bold text-sm text-[#083F43]">Seekers Admin</span>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-49px)]">
        <AdminNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
