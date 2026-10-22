"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin",            label: "Overview" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/members",    label: "Members" },
  { href: "/admin/knowledge",  label: "Knowledge" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="w-44 shrink-0 bg-white border-r border-[#E5E7E6] py-4 px-3 space-y-1">
      {LINKS.map(l => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className="block px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: active ? "#E8F2F2" : "transparent",
              color: active ? "#0B5D63" : "#4F5B59",
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
}
