"use client";

import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer
      className="w-full border-t"
      style={{ borderColor: "#D9E8E5", backgroundColor: "#F0EDE6" }}
      role="contentinfo"
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image src="/owl_head.svg" alt="Bisbi" width={20} height={20} />
              <span
                className="text-base font-semibold tracking-tight"
                style={{ color: "#1A1A18" }}
              >
                bisbi
              </span>
            </Link>
            <p className="text-sm" style={{ color: "#A8A8A2" }}>
              {t.footer.tagline1}
              <br />
              {t.footer.tagline2}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm" style={{ color: "#5C5C57" }}>
            <a
              href="mailto:hello@bisbi.app"
              className="transition-colors hover:text-[#1A1A18]"
            >
              {t.footer.contact}
            </a>
            <Link
              href="/legal"
              className="transition-colors hover:text-[#1A1A18]"
            >
              {t.footer.legal}
            </Link>
            <Link
              href="https://www.linkedin.com/in/joaquinmetayer"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#1A1A18]"
            >
              LinkedIn
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs" style={{ color: "#A8A8A2" }}>
          &copy; {new Date().getFullYear()} Bisbi. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
