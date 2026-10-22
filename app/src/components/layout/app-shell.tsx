"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  profile: { id: string; name: string; photo_url: string | null; roles: string[]; invite_code: string };
  hasBusiness?: boolean;
  children: React.ReactNode;
};

// NAV_ITEMS populated after icon definitions below — see getNavItems()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNavItems(): { href: string; label: string; icon: any }[] {
  return [
    { href: "/home",      label: "Home",      icon: HomeIcon },
    { href: "/directory", label: "Directory", icon: DirectoryIcon },
    { href: "/referrals", label: "Referrals", icon: ReferralsIcon },
    { href: "/community", label: "Community", icon: CommunityIcon },
    { href: "/me",        label: "Me",        icon: MeIcon },
  ];
}

export default function AppShell({ profile, hasBusiness, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "var(--canvas)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen shrink-0" style={{
        background: "#fff",
        borderRight: "1px solid var(--border)",
        boxShadow: "1px 0 0 0 var(--border)",
      }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#083F43,#0B5D63)" }}>S</div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "#083F43" }}>
              Seekers
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto pb-4">
          <NavSection label="Explore">
            <SidebarLink href="/directory"         label="Businesses"   icon={DirectoryIcon}  active={pathname.startsWith("/directory")} />
            <SidebarLink href="/members"           label="Members"      icon={MembersIcon}    active={pathname.startsWith("/members")} />
          </NavSection>

          <NavSection label="Referrals">
            <SidebarLink href="/referrals"         label="My Referrals" icon={ReferralsIcon}  active={pathname.startsWith("/referrals")} />
            <SidebarLink href="/leaderboard"       label="Leaderboard"  icon={TrophyIcon}     active={pathname.startsWith("/leaderboard")} />
            <SidebarLink href="/invite"            label="Invite"       icon={InviteIcon}     active={pathname.startsWith("/invite")} />
          </NavSection>

          <NavSection label="Community">
            <SidebarLink href="/community/events"  label="Events"       icon={EventsIcon}     active={pathname.startsWith("/community/events")} />
            <SidebarLink href="/community/knowledge" label="Knowledge"  icon={KnowledgeIcon}  active={pathname.startsWith("/community/knowledge")} />
            <SidebarLink href="/wealth-seekers"    label="Wealth Seekers" icon={WealthIcon}   active={pathname.startsWith("/wealth-seekers")} />
          </NavSection>

          {hasBusiness && (
            <NavSection label="My Business">
              <SidebarLink href="/my-business/enquiries" label="Enquiries"    icon={InboxIcon}     active={pathname.startsWith("/my-business/enquiries")} />
              <SidebarLink href="/my-business/catalogue" label="Catalogue"    icon={CatalogueIcon} active={pathname.startsWith("/my-business/catalogue")} />
              <SidebarLink href="/my-business/referrals" label="Referrals in" icon={ReferralsIcon} active={pathname.startsWith("/my-business/referrals")} />
              <SidebarLink href="/my-business/edit"      label="Edit listing" icon={EditIcon}      active={pathname.startsWith("/my-business/edit")} />
            </NavSection>
          )}

          {profile.roles?.includes("admin") && (
            <NavSection label="Admin">
              <SidebarLink href="/admin" label="Admin panel" icon={AdminIcon} active={pathname.startsWith("/admin")} />
            </NavSection>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t px-3 py-3 space-y-0.5" style={{ borderColor: "var(--border)" }}>
          <SidebarLink href="/faq" label="Help & FAQ" icon={HelpIcon} active={pathname === "/faq"} />
          <Link
            href="/me"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[#F0F2F0]"
            style={{ color: "var(--ink)" }}
          >
            <Avatar name={profile.name} photo={profile.photo_url} size={28} />
            <span className="truncate font-semibold">{profile.name.split(" ")[0]}</span>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 pb-20 lg:pb-0 min-h-screen overflow-y-auto">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t flex" style={{
        background: "#fff",
        borderColor: "var(--border)",
        boxShadow: "0 -1px 12px rgba(8,63,67,.08)",
      }}>
        {getNavItems().map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors"
              style={{ color: active ? "var(--brand)" : "var(--ink-2)" }}
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

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9BA5A3" }}>
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: (p: { active: boolean; size?: number }) => React.ReactElement; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? "linear-gradient(90deg,#EAF4F4,#F0F8F8)" : "transparent",
        color: active ? "var(--brand)" : "var(--ink-2)",
        fontWeight: active ? 600 : 500,
      }}
    >
      <Icon active={active} size={16} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
      )}
    </Link>
  );
}

function SignOutButton() {
  return (
    <form action="/api/auth/sign-out" method="POST">
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[#FBE9E6] text-left"
        style={{ color: "#9BA5A3" }}
      >
        <SignOutIcon active={false} size={16} />
        Sign out
      </button>
    </form>
  );
}

function Avatar({ name, photo, size = 32 }: { name: string; photo: string | null; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (photo) return <img src={photo} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#083F43,#0B5D63)", fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// Icons
const i = (d: string) => ({ active, size = 20 }: { active: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={active ? "var(--brand)" : "currentColor"} strokeWidth={active ? 2.2 : 1.8}
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const HomeIcon      = i("M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9");
const DirectoryIcon = i("M4 6h16M4 10h16M4 14h8M4 18h8");
const MembersIcon   = i("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z");
const ReferralsIcon = i("M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z");
const CommunityIcon = i("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z");
const MeIcon        = i("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z");
const TrophyIcon    = i("M8 21h8m-4-4v4m0-4a7 7 0 007-7V5H5v5a7 7 0 007 7zM5 8H3a2 2 0 000 4h2M19 8h2a2 2 0 010 4h-2");
const InviteIcon    = i("M12 4v16m8-8H4");
const EventsIcon    = i("M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z");
const KnowledgeIcon = i("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253");
const WealthIcon    = i("M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
const InboxIcon     = i("M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4");
const CatalogueIcon = i("M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z");
const EditIcon      = i("M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z");
const AdminIcon     = i("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z");
const HelpIcon      = i("M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
const SignOutIcon   = i("M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1");
