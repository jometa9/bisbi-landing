"use client";

import { LicenseKeyCard } from "@/components/license-key-card";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { MacOSIcon } from "@/components/icons/macos-icon";
import { useUserData } from "@/contexts/user-data-context";
import {
  fetchAllDownloads,
  handleDownload as doDownload,
  type DownloadOS,
} from "@/lib/download-handler";
import { ProductKey } from "@/lib/db/schema";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { customerPortalAction } from "@/lib/payments/actions";
import {
  ArrowDownToLine,
  Blocks,
  Book,
  BookOpen,
  Download,
  Mail,
  PartyPopper,
  Sparkles,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useMailtoCopy } from "@/hooks/use-mailto-copy";

const SUPPORT_EMAIL = "support@iptradecopier.com";

interface AllDownloads {
  multi?: {
    windows?: { version?: string; downloadUrl?: string | null };
    mac?: { version?: string; downloadUrl?: string | null };
  };
}

export function DashboardProductsOverview() {
  const router = useRouter();
  const { data, user, isLoading } = useUserData();
  const { copied, handleClick } = useMailtoCopy(SUPPORT_EMAIL);
  const [isPortalLoading, setIsPortalLoading] = useState<"multi" | null>(null);
  const [downloads, setDownloads] = useState<AllDownloads | null>(null);
  const windowsDemoUrl = "https://www.youtube.com/watch?v=lpPXse5LJSg";

  const isAdmin = user?.role === "admin" || data?.isAdmin || false;
  const entitlements = data?.entitlements;

  useEffect(() => {
    const loadDownloads = async () => {
      const d = await fetchAllDownloads();
      setDownloads(d);
    };
    loadDownloads();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial";
      case "canceled":
      case "canceling":
        return "Canceled";
      case "past_due":
        return "Past due";
      case "admin_assigned":
        return "Admin assigned";
      case "expired":
        return "Expired";
      default:
        return "No subscription";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "unlimited":
        return "Unlimited";
      case "pro":
        return "Pro";
      default:
        return "Free";
    }
  };

  const handleSubscribe = useCallback(() => {
    router.push("/dashboard/pricing");
  }, [router]);

  const handlePortalRedirect = useCallback(
    async (productKey: "multi") => {
      setIsPortalLoading(productKey);
      try {
        const result = await customerPortalAction(productKey);
        if (result?.redirect) {
          window.location.href = result.redirect;
        }
      } finally {
        setIsPortalLoading(null);
      }
    },
    []
  );

  const hasDownloadUrl = useCallback(
    (productKey: ProductKey, os: DownloadOS): boolean => {
      if (!downloads || productKey !== "multi") return false;
      return os === "mac"
        ? !!downloads.multi?.mac?.downloadUrl
        : !!downloads.multi?.windows?.downloadUrl;
    },
    [downloads]
  );

  const handleDownloadClick = useCallback(
    async (productKey: ProductKey, os: DownloadOS) => {
      if (!hasDownloadUrl(productKey, os)) return;
      await doDownload(productKey, os);
    },
    [hasDownloadUrl]
  );

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-lg bg-white p-3 h-48"></div>
            <div className="rounded-lg bg-white p-3 h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  const subscription = entitlements?.multi;
  const hasActiveSubscription = subscription?.active || isAdmin;
  const hasSubscription = subscription !== null;
  const hasExpirationDate = subscription?.expiresAt != null;
  const isAdminAssigned = subscription?.status === "admin_assigned";
  const isCanceled = subscription?.status === "canceled";
  const isCanceling = subscription?.status === "canceling";

  const displayLabel = isAdmin
    ? "Unlimited"
    : hasActiveSubscription
      ? getTierLabel(subscription?.tier || "free")
      : hasSubscription || hasExpirationDate
        ? getStatusLabel(subscription?.status || "none")
        : "Free";

  const cardWrapper = "rounded-lg bg-gray-100 p-3";
  const cardInner = "rounded-lg bg-white p-3 border border-gray-200";

  return (
    <div className="space-y-3">
      {!paymentsEnabled && (
        <div className={cardWrapper}>
          <div className={cardInner}>
            <div className="flex flex-col mb-1">
              <div className="flex gap-2 items-center pb-1">
                <PartyPopper className="h-5 w-5 text-yellow-700" />
                <p className="text-lg text-yellow-700">We’re in Open Beta</p>
              </div>
              <p className="text-xs mb-1 text-yellow-700">
                We’re actively improving the infrastructure and adding new features.
              </p>
              <p className="text-xs mb-1 text-yellow-700">
                During this phase, you have full access at no cost.
              </p>
              <p className="text-xs text-yellow-700">
                Payments will be enabled once the beta period ends.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className={cardWrapper}>
        <div className={cardInner}>
          <div className="flex flex-col mb-2">
            <div className="flex gap-2 items-center pb-1">
              <Blocks className="h-5 w-5" />
              <p className="text-lg text-gray-700">IPTRADE Multi</p>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Local copy — Windows (MT4, MT5, cTrader) & macOS (MT5 direct & cTrader)
            </p>
            <p className="text-xl font-semibold">{displayLabel}</p>
            {!isAdmin && (
              <>
                <p className="text-xs text-muted-foreground">
                  Status: {getStatusLabel(subscription?.status || "none")}
                </p>
                {subscription?.billingPeriod && (
                  <p className="text-xs text-muted-foreground">
                    Billing:{" "}
                    {subscription.billingPeriod === "annual" ? "Annual" : "Monthly"}
                  </p>
                )}
                {subscription?.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {(subscription.status === "canceling" ||
                      (subscription.status === "canceled" &&
                        new Date(subscription.expiresAt) > new Date()))
                      ? "Valid until: "
                      : hasActiveSubscription
                        ? "Renews: "
                        : "Expires: "}
                    {new Date(subscription.expiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </>
            )}
            {isAdmin && (
              <p className="text-xs text-muted-foreground">Admin access</p>
            )}
          </div>

          {!paymentsEnabled ? (
            <button
              type="button"
              disabled
              className="mt-1 rounded-full border border-gray-300 bg-gray-100 py-1 px-3 text-sm text-gray-500 cursor-default text-center"
            >
              Payments disabled
            </button>
          ) : isAdmin ? (
            <button
              type="button"
              disabled
              className="mt-1 rounded-full border border-gray-300 bg-gray-100 py-1 px-3 text-sm text-gray-500 cursor-default text-center"
            >
              You are the boss
            </button>
          ) : isAdminAssigned ? (
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 mt-1">
              <p className="text-sm text-gray-600">
                Plan assigned by administrator.
                {subscription?.expiresAt && (
                  <span>
                    {" "}
                    Valid until{" "}
                    {new Date(subscription.expiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    .
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contact an administrator if you need to modify your subscription.
              </p>
            </div>
          ) : hasActiveSubscription ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              {isCanceling ? (
                <>
                  <button
                    type="button"
                    onClick={() => handlePortalRedirect("multi")}
                    className="cursor-pointer rounded-full text-white bg-black py-1 px-3 text-sm hover:bg-gray-600 text-center"
                  >
                    {isPortalLoading === "multi" ? "Opening..." : "Reactivate"}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border bg-white py-1 px-3 text-sm hover:bg-gray-100 text-center"
                    onClick={handleSubscribe}
                  >
                    Change plan
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full text-white bg-black py-1 px-3 text-sm hover:bg-gray-600 text-center"
                    onClick={handleSubscribe}
                  >
                    Change plan
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePortalRedirect("multi")}
                    className="cursor-pointer rounded-full border bg-white py-1 px-3 text-sm hover:bg-gray-100 text-center"
                  >
                    {isPortalLoading === "multi" ? "Opening..." : "Manage"}
                  </button>
                </>
              )}
            </div>
          ) : isCanceled && hasSubscription ? (
            <button
              type="button"
              className="cursor-pointer rounded-full text-white bg-black py-1 px-3 text-sm hover:bg-gray-600 text-center inline-block mt-1"
              onClick={handleSubscribe}
            >
              Resubscribe
            </button>
          ) : (
            <button
              type="button"
              className="cursor-pointer rounded-full text-white bg-black py-1 px-3 text-sm hover:bg-gray-600 text-center inline-block mt-1"
              onClick={handleSubscribe}
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
      <div className={cardWrapper}>
        <div className={cardInner}>
          <div className="flex flex-col mb-2">
            <div className="flex gap-2 items-center pb-1">
              <Download className="h-5 w-5 text-gray-700" />
              <p className="text-lg text-gray-700">Download</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Available for Windows and macOS
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div
              className={`rounded-lg border cursor-pointer border-gray-200 transition-all px-4 py-3 ${hasDownloadUrl("multi", "windows")
                ? "hover:bg-white cursor-pointer bg-gray-50"
                : "opacity-60 cursor-default bg-gray-50"
                }`}
              onClick={() => handleDownloadClick("multi", "windows")}
            >
              <div className="flex  items-end justify-between">
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2 items-center">
                    <WindowsIcon className="h-5 w-5 text-gray-800" />
                    <p className="text-lg text-gray-700">
                      Windows 64-bit
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Version {downloads?.multi?.windows?.version || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MT4, MT5 & cTrader
                    </p>
                  </div>
                </div>
                <ArrowDownToLine className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div
              className={`rounded-lg border cursor-pointer border-gray-200 transition-all px-4 py-3 ${hasDownloadUrl("multi", "mac")
                ? "hover:bg-white cursor-pointer bg-gray-50"
                : "opacity-60 cursor-default bg-gray-50"
                }`}
              onClick={() => handleDownloadClick("multi", "mac")}
            >
              <div className="flex items-end justify-between">
                <div className="flex gap-2 flex-col">

                  <div className="flex gap-2 items-center">
                    <MacOSIcon className="h-5 w-5 text-gray-800" />
                    <p className="text-lg text-gray-700">
                      macOS ARM64
                    </p>

                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Version {downloads?.multi?.mac?.version || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MT5 direct & cTrader
                    </p>
                  </div>
                </div>

                <ArrowDownToLine className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
          <div className="mt-4 px-1 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link
              href="/dashboard/documentation#installation-and-demo"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={true}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors w-fit"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>
                First time? View setup guide
                {` `}
                <span className="underline">here</span>
              </span>
            </Link>
            <a
              href={windowsDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors w-fit"
            >
              <Youtube className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-black transition-colors sm:order-2" />
              <span className="sm:order-1">Watch demo</span>
            </a>
          </div>
        </div>
      </div>
      <div className={cardWrapper}>
        <div className={cardInner}>
          <LicenseKeyCard user={user} />
        </div>
      </div>

      <div className="rounded-lg bg-gray-100 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Link
            href="/dashboard/assistant"
            prefetch={true}
            className="group rounded-lg bg-white p-3 px-4 border border-gray-200 hover:bg-gray-50 cursor-pointer block transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-col">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-gray-700" />
                  <p className="text-lg">AI Assistant</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ask Ugo anything</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/documentation"
            prefetch={true}
            className="group rounded-lg bg-white p-3 px-4 border border-gray-200 hover:bg-gray-50 cursor-pointer block transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-col">
                <div className="flex items-center justify-center gap-2">
                  <Book className="w-5 h-5  text-gray-700" />
                  <p className="text-lg">Documentation</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Help and setup guides</p>
                </div>
              </div>
            </div>
          </Link>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            onClick={handleClick}
            className="group rounded-lg bg-white p-3 px-4 border border-gray-200 hover:bg-gray-50 cursor-pointer block transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-col">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-gray-700" />
                  <p className="text-lg">Email Support</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {copied ? "Copied to clipboard" : "Get in touch"}
                  </p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
