"use client";

import { MacOSIcon } from "@/components/icons/macos-icon";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { useI18n } from "@/lib/i18n";
import { DOWNLOADS, detectOS, type DownloadOS } from "@/lib/downloads";
import { useEffect, useState, type ComponentType } from "react";

const ICONS: Record<DownloadOS, ComponentType<{ className?: string }>> = {
  mac: MacOSIcon,
  windows: WindowsIcon,
};

interface DownloadButtonsProps {
  variant?: "hero" | "cta" | "header";
}

export function DownloadButtons({ variant = "hero" }: DownloadButtonsProps) {
  const { t } = useI18n();
  const [primaryOS, setPrimaryOS] = useState<DownloadOS | null>(null);

  useEffect(() => {
    setPrimaryOS(detectOS());
  }, []);

  const labelFor = (os: DownloadOS) =>
    os === "mac" ? t.download.mac : t.download.windows;

  const orderedOS: DownloadOS[] =
    primaryOS === "windows" ? ["windows", "mac"] : ["mac", "windows"];

  if (variant === "header") {
    const os = primaryOS ?? "mac";
    const Icon = ICONS[os];
    return (
      <a
        href={DOWNLOADS[os]}
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
        <Icon className="w-4 h-4" />
        {labelFor(os)}
      </a>
    );
  }

  const padding = variant === "hero" ? "px-6 py-3" : "px-5 py-2.5";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {orderedOS.map((os, idx) => {
        const Icon = ICONS[os];
        const isPrimary = idx === 0;
        return (
          <a
            key={os}
            href={DOWNLOADS[os]}
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-full ${padding} text-sm font-medium cursor-pointer transition-colors`}
            style={{
              backgroundColor: isPrimary ? "#7BA89C" : "#E6EFED",
              color: isPrimary ? "#FFFFFF" : "#1A1A18",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isPrimary
                ? "#5A8C83"
                : "#D9E8E5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isPrimary
                ? "#7BA89C"
                : "#E6EFED";
            }}
          >
            <Icon className="w-4 h-4" />
            {labelFor(os)}
          </a>
        );
      })}
    </div>
  );
}
