"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const { t } = useI18n();

  const getCurrentPageTitle = () => {
    if (pathname?.includes("/inbox")) {
      return t.admin.breadcrumb.inbox;
    }
    if (pathname?.includes("/settings")) {
      return t.admin.breadcrumb.settings;
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
          {t.admin.breadcrumb.inbox}
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-400">{t.admin.breadcrumb.email}</span>
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
          {t.admin.breadcrumb.inbox}
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-400">{t.admin.breadcrumb.new}</span>
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
