"use client";

import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { useUserData } from "@/contexts/user-data-context";
import Image from "next/image";
import { useEffect, useState } from "react";

type OS = "mac" | "windows" | "unknown";

function detectOS(): OS {
  if (typeof window === "undefined") return "unknown";
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "unknown";
}

function interpolate(str: string, vars: Record<string, string>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export default function DashboardPage() {
  const { data } = useUserData();
  const { t } = useI18n();
  const [os, setOS] = useState<OS>("unknown");
  const [downloading, setDownloading] = useState<"mac" | "windows" | null>(null);

  useEffect(() => {
    setOS(detectOS());
  }, []);

  const userName =
    data?.name?.split(" ")[0] || data?.email?.split("@")[0] || "there";

  const showMac = os === "mac" || os === "unknown";
  const showWin = os === "windows" || os === "unknown";

  const handleClick = async (platform: "mac" | "windows") => {
    setDownloading(platform);
    await handleDownload("multi", platform);
    setTimeout(() => setDownloading(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="rounded-2xl p-4 mb-8"
        style={{ backgroundColor: "#E6EFED" }}
      >
        <Image src="/owl_head.svg" alt="Bisbi" width={40} height={40} />
      </div>

      <h1 className="text-2xl font-semibold mb-2" style={{ color: "#1A1A18" }}>
        {interpolate(t.dashboard.greeting, { name: userName })}
      </h1>

      <p className="text-base mb-10 max-w-sm" style={{ color: "#5C5C57" }}>
        {t.dashboard.ready}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {showMac && (
          <button
            onClick={() => handleClick("mac")}
            disabled={downloading !== null}
            className="inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-70"
            style={{ backgroundColor: "#7BA89C" }}
            onMouseEnter={(e) => {
              if (!downloading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#5A8C83";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#7BA89C";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            {downloading === "mac" ? t.dashboard.starting : t.dashboard.downloadMac}
          </button>
        )}

        {showWin && (
          <button
            onClick={() => handleClick("windows")}
            disabled={downloading !== null}
            className="inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium transition-colors disabled:opacity-70"
            style={{
              backgroundColor: showMac ? "#E6EFED" : "#7BA89C",
              color: showMac ? "#1A1A18" : "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              if (!downloading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  showMac ? "#D9E8E5" : "#5A8C83";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                showMac ? "#E6EFED" : "#7BA89C";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 12V6.75l6-1.32v6.57H3zM20 3v8.75h-8V5.05L20 3zM3 13h6v6.43l-6-1.43V13zm17 0v8.75l-8-2V13h8z" />
            </svg>
            {downloading === "windows"
              ? t.dashboard.starting
              : t.dashboard.downloadWindows}
          </button>
        )}
      </div>

      <p className="mt-8 text-xs" style={{ color: "#A8A8A2" }}>
        {t.dashboard.hint}
      </p>
    </div>
  );
}
