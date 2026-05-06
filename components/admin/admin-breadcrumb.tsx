"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBreadcrumb() {
  const pathname = usePathname();

  const getCurrentPageTitle = () => {
    if (pathname?.includes("/inbox")) {
      return "Inbox";
    }
    if (pathname?.includes("/settings")) {
      return "Settings";
    }
    return null;
  };

  const currentPageTitle = getCurrentPageTitle();
  const isInboxDetailPage = pathname?.match(/\/dashboard\/admin\/inbox\/[^/]+$/);
  const isInboxNewPage = pathname === "/dashboard/admin/inbox/new";

  if (isInboxDetailPage) {
    return (
      <div className="flex items-baseline gap-3">
        <Link
          href="/dashboard/admin/inbox"
          className="text-sm text-gray-400 hover:text-gray-800 cursor-pointer"
        >
          Inbox
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-400">Email</span>
      </div>
    );
  }

  if (isInboxNewPage) {
    return (
      <div className="flex items-baseline gap-3">
        <Link
          href="/dashboard/admin/inbox"
          className="text-sm text-gray-400 hover:text-gray-800 cursor-pointer"
        >
          Inbox
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-400">New</span>
      </div>
    );
  }

  if (currentPageTitle) {
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-sm text-gray-400">{currentPageTitle}</span>
      </div>
    );
  }

  return null;
}
