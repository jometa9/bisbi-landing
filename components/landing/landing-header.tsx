"use client";

import { DownloadButtons } from "@/components/landing/download-buttons";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";

export function LandingHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
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
          <DownloadButtons variant="header" />
        </div>
      </div>
    </header>
  );
}
