"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/my-business/edit",      label: "Listing" },
  { href: "/my-business/catalogue", label: "Catalogue" },
  { href: "/my-business/enquiries", label: "Enquiries" },
  { href: "/my-business/referrals", label: "Referrals" },
];

export default function MyBusinessNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-[#E5E7E6] px-4 flex gap-1 overflow-x-auto">
      {TABS.map(tab => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: active ? "#0B5D63" : "transparent",
              color: active ? "#0B5D63" : "#4F5B59",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
