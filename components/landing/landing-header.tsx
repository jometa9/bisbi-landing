"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

export function LandingHeader() {
  const { t } = useI18n();

  const navigationLinks = [
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/#features", label: t.nav.features },
    { href: "/#languages", label: t.nav.languages },
  ];

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.includes("#")) return;
    e.preventDefault();
    const id = href.split("#")[1];
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#F0EDE6" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/owl_head.svg" alt="Bisbi" width={24} height={24} />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "#1A1A18" }}
          >
            bisbi
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                handleNavClick(e, link.href)
              }
              className="cursor-pointer"
              style={{ color: "#A8A8A2" }}
              onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = "#5C5C57";
              }}
              onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = "#A8A8A2";
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="text-sm hidden md:block"
            style={{ color: "#5C5C57" }}
          >
            {t.nav.signIn}
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
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
