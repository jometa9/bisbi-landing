"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function LandingHeader() {
  const { t } = useI18n();
  const router = useRouter();

  const handleDownloadClick = () => {
    router.push("/dashboard");
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center cursor-pointer">
          <span
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "#7BA89C" }}
          >
            Bisbi
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleDownloadClick}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white cursor-pointer"
            style={{ backgroundColor: "#7BA89C" }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#5A8C83";
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#7BA89C";
            }}
          >
            {t.nav.downloadFree}
          </button>
        </div>
      </div>
    </header>
  );
}
