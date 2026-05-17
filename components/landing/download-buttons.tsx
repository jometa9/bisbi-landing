"use client";

import { useI18n } from "@/lib/i18n";
import { DOWNLOADS } from "@/lib/downloads";

interface DownloadButtonsProps {
  variant?: "hero" | "cta" | "header";
}

export function DownloadButtons({ variant = "hero" }: DownloadButtonsProps) {
  const { t } = useI18n();

  const href = DOWNLOADS.mac;

  if (variant === "header") {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white cursor-pointer transition-colors"
        style={{ backgroundColor: "#7BA89C" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#5A8C83";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#7BA89C";
        }}
      >
        {t.download.label}
      </a>
    );
  }

  const padding = variant === "hero" ? "px-6 py-3" : "px-5 py-2.5";
  const label = variant === "hero" ? t.download.heroLabel : t.download.label;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={href}
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 rounded-full ${padding} text-sm font-medium cursor-pointer transition-colors`}
        style={{ backgroundColor: "#7BA89C", color: "#FFFFFF" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#5A8C83";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#7BA89C";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        {label}
      </a>
    </div>
  );
}
