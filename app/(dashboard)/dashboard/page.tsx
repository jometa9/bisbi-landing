"use client";

import { LinuxIcon } from "@/components/icons/linux-icon";
import { MacOSIcon } from "@/components/icons/macos-icon";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { detectOS, handleDownload, type DownloadOS } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { useUserData } from "@/contexts/user-data-context";
import { Inbox, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const REDIRECT_DELAY_MS = 4000;

function interpolate(str: string, vars: Record<string, string>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

function DashboardContent() {
  const { data } = useUserData();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");
  const isCheckoutSuccess = checkoutResult === "success";
  const isCheckoutCancel = checkoutResult === "cancel";
  const isPostCheckout = isCheckoutSuccess || isCheckoutCancel;

  const [downloading, setDownloading] = useState<DownloadOS | null>(null);
  const [detectedOS, setDetectedOS] = useState<DownloadOS>("mac");

  useEffect(() => {
    setDetectedOS(detectOS());
  }, []);

  useEffect(() => {
    if (!isCheckoutSuccess || !checkoutSessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/track-purchase", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: checkoutSessionId }),
        });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!json?.eventId) return;
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq(
            "track",
            "Purchase",
            {
              value: json.value,
              currency: json.currency,
              content_name: "bisbi",
              content_ids: [json.eventId.split("_")[1]].filter(Boolean),
            },
            { eventID: json.eventId }
          );
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [isCheckoutSuccess, checkoutSessionId]);

  const userName =
    data?.name?.split(" ")[0] ||
    data?.email?.split("@")[0] ||
    t.dashboard.fallbackName;

  const isPro =
    data?.entitlements?.bisbi?.active === true &&
    data?.entitlements?.bisbi?.tier === "pro";

  useEffect(() => {
    if (!isPostCheckout) return;
    let cancelled = false;

    const redirectToApp = async () => {
      let target = "bisbi://login";
      try {
        const res = await fetch("/api/web-login", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.user?.apiKey) {
            const url = new URL("bisbi://login");
            url.searchParams.set("apiKey", json.user.apiKey);
            target = url.toString();
          }
        }
      } catch {}
      if (!cancelled) {
        window.location.href = target;
      }
    };

    const timer = setTimeout(redirectToApp, REDIRECT_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isPostCheckout]);

  const handleClick = async (platform: DownloadOS) => {
    setDownloading(platform);
    await handleDownload("bisbi", platform);
    setTimeout(() => setDownloading(null), 3000);
  };

  const platformIcon = {
    mac: MacOSIcon,
    windows: WindowsIcon,
    linux: LinuxIcon,
  } as const;

  const renderDownloadButton = (
    platform: DownloadOS,
    variant: "primary" | "secondary"
  ) => {
    const Icon = platformIcon[platform];
    const label =
      platform === "mac"
        ? t.dashboard.downloadMac
        : platform === "windows"
          ? t.dashboard.downloadWindows
          : t.dashboard.downloadLinux;
    const isPrimary = variant === "primary";
    const baseBg = isPrimary ? "#7BA89C" : "#F0EDE6";
    const hoverBg = isPrimary ? "#5A8C83" : "#E6EFED";
    const textColor = isPrimary ? "#FFFFFF" : "#1A1A18";

    return (
      <button
        key={platform}
        onClick={() => handleClick(platform)}
        disabled={downloading !== null}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
        style={{ backgroundColor: baseBg, color: textColor }}
        onMouseEnter={(e) => {
          if (!downloading)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              hoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            baseBg;
        }}
      >
        <Icon className="h-[18px] w-[18px]" />
        {downloading === platform ? t.dashboard.starting : label}
      </button>
    );
  };

  const variantFor = (platform: DownloadOS) =>
    platform === detectedOS ? "primary" : "secondary";

  const title = isCheckoutSuccess
    ? t.dashboard.checkoutSuccessTitle
    : isCheckoutCancel
      ? t.dashboard.checkoutCancelTitle
      : interpolate(t.dashboard.greeting, { name: userName });

  const subtitle = isCheckoutSuccess
    ? t.dashboard.checkoutSuccessSubtitle
    : isCheckoutCancel
      ? t.dashboard.checkoutCancelSubtitle
      : t.dashboard.ready;

  return (
    <div className="relative flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-5xl mx-auto px-6 py-20 text-center">
        <h1
          className="text-3xl md:text-4xl font-semibold mb-4"
          style={{ color: "#1A1A18" }}
        >
          {title}
        </h1>

        <p
          className="text-base md:text-lg mb-12 max-w-5xl mx-auto"
          style={{ color: "#5C5C57" }}
        >
          {subtitle}
        </p>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              {renderDownloadButton("mac", variantFor("mac"))}
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:justify-center">
              {renderDownloadButton("windows", variantFor("windows"))}
              {renderDownloadButton("linux", variantFor("linux"))}
            </div>
          </div>

          <div className="flex sm:justify-center">
            <span
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: isPro ? "#E6EFED" : "#F0EDE6",
                color: isPro ? "#5A8C83" : "#5C5C57",
              }}
            >
              {isPro ? t.dashboard.planProBadge : t.dashboard.planFreeBadge}
            </span>
          </div>

          {data?.isAdmin && (
            <div className="flex flex-col sm:flex-row gap-6 sm:justify-center">
              <button
                onClick={() => router.push("/dashboard/admin/inbox")}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer"
                style={{ backgroundColor: "#F0EDE6", color: "#1A1A18" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#E6EFED";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#F0EDE6";
                }}
              >
                <Inbox size={16} />
                {t.dashboard.inboxButton}
              </button>

              <button
                onClick={() => router.push("/dashboard/admin/settings")}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer"
                style={{ backgroundColor: "#F0EDE6", color: "#1A1A18" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#E6EFED";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#F0EDE6";
                }}
              >
                <Settings size={16} />
                {t.dashboard.settingsButton}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs" style={{ color: "#A8A8A2" }}>
          {t.dashboard.hint}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
