"use client";

import { useI18n } from "@/lib/i18n";
import { SOURCE_REPO_URL } from "@/lib/downloads";
import Link from "next/link";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer
      className="w-full"
      style={{ backgroundColor: "#FFFFFF" }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="footer-card">
          <div className="footer-card-watermark" aria-hidden="true" />
          <div className="footer-card-content">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="max-w-md">
                <Link href="/" className="flex items-center mb-3 cursor-pointer">
                  <span
                    className="text-4xl font-semibold tracking-tight"
                    style={{ color: "#7BA89C" }}
                  >
                    Bisbi
                  </span>
                </Link>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5C5C57" }}
                >
                  {t.hero.subheadline}
                </p>
                <p className="mt-3 text-xs" style={{ color: "#A8A8A2" }}>
                  {t.footer.createdBy}{" "}
                  <a
                    href="https://api2labs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#1A1A18] cursor-pointer font-medium"
                    style={{ color: "#7BA89C" }}
                  >
                    API2LABS.COM
                  </a>
                </p>
              </div>

              <div
                className="flex flex-wrap gap-6 text-sm"
                style={{ color: "#5C5C57" }}
              >
                <a
                  href={SOURCE_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#1A1A18] cursor-pointer"
                >
                  {t.footer.source}
                </a>
              </div>
            </div>

            <p className="text-xs" style={{ color: "#A8A8A2" }}>
              &copy; {new Date().getFullYear()} Bisbi. {t.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

