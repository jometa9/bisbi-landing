"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { User } from "@/lib/db/schema";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { cn } from "@/lib/utils";
import {
  Book,
  CreditCard,
  Home,
  Inbox,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

interface SidebarProps {
  user: User;
  items?: SidebarItem[];
  variant?: "desktop" | "mobile";
}

const defaultItems: SidebarItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Assistant",
    href: "/dashboard/assistant",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    label: "Docs",
    href: "/dashboard/documentation",
    icon: <Book className="h-4 w-4" />,
  },
  {
    label: "Pricing",
    href: "/dashboard/pricing",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    label: "Inbox",
    href: "/dashboard/admin/inbox",
    icon: <Inbox className="h-4 w-4" />,
    adminOnly: true,
  },
  {
    label: "Settings",
    href: "/dashboard/admin/settings",
    icon: <Settings className="h-4 w-4" />,
    adminOnly: true,
  },
];

export function Sidebar({
  user,
  items = defaultItems,
  variant = "desktop",
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const isMobileVariant = variant === "mobile";

  const allItems = paymentsEnabled
    ? items
    : items.filter((item) => item.href !== "/dashboard/pricing");

  const visibleItems = allItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  const handleLinkClick = () => {
    if (isMobileVariant) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (!isMobileVariant) return;
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileVariant, isSidebarOpen]);

  if (isMobileVariant) {
    return (
      <>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <nav
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col gap-1 px-3",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-foreground">
                IPTRADE
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="pl-1 text-gray-400 hover:text-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-2 px-0 py-1 text-sm rounded-lg transition-colors w-full",
                  isActive ? "text-black" : "text-gray-400 hover:text-gray-800"
                )}
              >
                <span className="[&>svg]:transition-colors">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </>
    );
  }

  return (
    <nav className="relative px-1 gap-1 flex flex-col">
      {visibleItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            pathname?.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              "flex items-center gap-2 px-2 py-1 text-sm rounded-lg transition-colors",
              isActive ? "text-black" : "text-gray-400 hover:text-gray-800"
            )}
          >
            <span className="[&>svg]:transition-colors">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
