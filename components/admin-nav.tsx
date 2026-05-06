"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b px-6 flex gap-1"
      style={{ borderColor: "#D9E8E5", backgroundColor: "#F0EDE6" }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: isActive ? "#7BA89C" : "transparent",
              color: isActive ? "#1A1A18" : "#5C5C57",
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
