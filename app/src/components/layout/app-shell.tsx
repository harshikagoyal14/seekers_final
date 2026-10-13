"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  profile: { id: string; name: string; photo_url: string | null; roles: string[]; invite_code: string };
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/home",       label: "Home",       icon: HomeIcon },
  { href: "/directory",  label: "Directory",  icon: DirectoryIcon },
  { href: "/referrals",  label: "Referrals",  icon: ReferralsIcon },
  { href: "/community",  label: "Community",  icon: CommunityIcon },
  { href: "/me",         label: "Me",         icon: MeIcon },
];

export default function AppShell({ profile, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#F6F7F5" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r bg-white shrink-0" style={{ borderColor: "#E5E7E6" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "#E5E7E6" }}>
          <Link href="/home" className="font-bold text-xl" style={{ color: "#083F43" }}>
            Seekers<span style={{ color: "#0B5D63" }}>.</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4F5B59" }}>Find</p>
          <SidebarLink href="/directory" label="Businesses" active={pathname.startsWith("/directory")} />
          <SidebarLink href="/members" label="Members" active={pathname.startsWith("/members")} />

          <p className="px-3 py-1 mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4F5B59" }}>Refer</p>
          <SidebarLink href="/referrals" label="Referrals" active={pathname.startsWith("/referrals")} />
          <SidebarLink href="/invite" label="Invite a member" active={pathname.startsWith("/invite")} />

          <p className="px-3 py-1 mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4F5B59" }}>Community</p>
          <SidebarLink href="/community/events" label="Events & Initiatives" active={pathname.startsWith("/community/events")} />
          <SidebarLink href="/community/knowledge" label="Knowledge" active={pathname.startsWith("/community/knowledge")} />
        </nav>

        <div className="border-t px-3 py-4 space-y-1" style={{ borderColor: "#E5E7E6" }}>
          <SidebarLink href="/faq" label="Help & FAQ" active={pathname === "/faq"} />
          <Link
            href="/me"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#F6F7F5]"
            style={{ color: "#15201E" }}
          >
            <Avatar name={profile.name} photo={profile.photo_url} size={28} />
            <span className="truncate">{profile.name.split(" ")[0]}</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t flex" style={{ borderColor: "#E5E7E6" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors"
              style={{ color: active ? "#0B5D63" : "#4F5B59" }}
            >
              <Icon active={active} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: active ? "#E8F2F2" : "transparent",
        color: active ? "#0B5D63" : "#15201E",
      }}
    >
      {label}
    </Link>
  );
}

function Avatar({ name, photo, size = 32 }: { name: string; photo: string | null; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (photo) return <img src={photo} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white text-xs shrink-0"
      style={{ width: size, height: size, background: "#0B5D63", fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// Simple SVG icons
function HomeIcon({ active }: { active: boolean }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#0B5D63" : "#4F5B59"} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>;
}
function DirectoryIcon({ active }: { active: boolean }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#0B5D63" : "#4F5B59"} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8M4 18h8" /></svg>;
}
function ReferralsIcon({ active }: { active: boolean }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#0B5D63" : "#4F5B59"} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
}
function CommunityIcon({ active }: { active: boolean }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#0B5D63" : "#4F5B59"} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function MeIcon({ active }: { active: boolean }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#0B5D63" : "#4F5B59"} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
