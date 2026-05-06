"use client";

import { MacOSIcon } from "@/components/icons/macos-icon";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { Check, ArrowDownToLine, BlocksIcon, Youtube, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductKey } from "@/lib/db/schema";
import {
  DownloadOS,
  fetchAllDownloads,
  handleDownload,
} from "@/lib/download-handler";
import { ninjatraderEnabled } from "@/lib/payments/feature-flag";

interface DownloadInfo {
  version: string;
  downloadUrl: string;
}

interface AllDownloads {
  multi: {
    windows: DownloadInfo;
    mac: DownloadInfo;
  };
}

type ProductsSectionVariant = "default" | "prop-firms";

interface ProductsSectionProps {
  variant?: ProductsSectionVariant;
  demoSide?: "left" | "right";
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    let id = "";

    if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.replace("/", "");
    } else if (parsed.hostname.includes("youtube.com")) {
      id = parsed.searchParams.get("v") ?? "";
    }

    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
  } catch {
    return null;
  }
};

export function ProductsSection({ variant = "default", demoSide = "right" }: ProductsSectionProps) {
  const [downloads, setDownloads] = useState<AllDownloads | null>(null);
  const isPropFirms = variant === "prop-firms";
  const isDemoLeft = demoSide === "left";
  const gridColsClass = isDemoLeft
    ? "md:grid-cols-[3fr_2fr]"
    : "md:grid-cols-[2fr_3fr]";
  const textColClass = isDemoLeft ? "md:order-2" : "md:order-1";
  const imageColClass = isDemoLeft ? "md:order-1" : "md:order-2";
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDemoVideoLoading, setIsDemoVideoLoading] = useState(false);
  const windowsDemoUrl = "https://www.youtube.com/watch?v=lpPXse5LJSg";
  const [demoImageSrc, setDemoImageSrc] = useState<string>(
    "/assets/demo-windows.png"
  );

  useEffect(() => {
    const loadDownloads = async () => {
      const data = await fetchAllDownloads();
      setDownloads(data);
    };
    loadDownloads();
  }, []);

  useEffect(() => {
    if (!isDemoModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDemoModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDemoModalOpen]);

  useEffect(() => {
    setIsDemoVideoLoading(isDemoModalOpen);
  }, [isDemoModalOpen]);

  const hasDownloadUrl = (productKey: ProductKey, os: DownloadOS): boolean => {
    if (!downloads) return true;
    if (productKey !== "multi") return false;
    return os === "mac"
      ? !!downloads.multi?.mac?.downloadUrl
      : !!downloads.multi?.windows?.downloadUrl;
  };

  const handleDownloadClick = async (
    productKey: ProductKey,
    os: DownloadOS
  ) => {
    if (downloads && !hasDownloadUrl(productKey, os)) return;
    await handleDownload(productKey, os);
  };

  const subtitle = isPropFirms ? "Our application" : "Our desktop app";
  const title = isPropFirms
    ? "IPTRADE Multi—100% local, single IP for prop firm use"
    : "Local copy on your computer";
  const description = isPropFirms
    ? "Copy across MT4, MT5 & cTrader on Windows, and MT5 & cTrader on macOS—all from one computer. Single IP address, complete local processing. Designed to help you meet typical prop firm IP restrictions—other rules depend on each firm; see our Terms of Use."
    : "MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. Copy across brokers with zero cloud latency. Single IP, full lot control; single IP helps meet typical prop firm IP rules—see Terms of Use for details.";
  const bullets = isPropFirms
    ? [
      "Single IP for all accounts—designed so prop firms see one location",
      "100% local—no external servers, no data leaving your machine",
      "MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS",
    ]
    : [
      "MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS",
      "Cross-platform trade copying",
      "Windows and macOS compatible",
    ];

  return (
    <section className={`py-24`} id="products">
      <div className="px-3 max-w-7xl mx-auto">
        <p className="text-gray-600 text-xl mb-1">{subtitle}</p>
        <h2 className="text-3xl text-gray-900 mb-6">{title}</h2>

        <div className="bg-gray-100 rounded-lg p-5 md:p-6">
          <div className={`grid grid-cols-1 ${gridColsClass} gap-6 md:gap-8 `}>
            <div className={`flex flex-col justify-between order-2 ${textColClass}`}>
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center justify-center gap-2 h-12 w-12 rounded-lg bg-white border border-gray-200">
                    <BlocksIcon className="h-6 w-6 text-gray-600" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold">IPTRADE Multi</h3>
                    <p className="text text-gray-500">Windows and macOS</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-col items-start md:gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/metatrader4.png"
                      alt="MetaTrader 4"
                      className="h-7 grayscale opacity-70 shrink-0"
                    />
                    <img
                      src="/assets/metatrader5.png"
                      alt="MetaTrader 5"
                      className="h-7 grayscale opacity-70 shrink-0"
                    />
                    {!ninjatraderEnabled && (
                      <img
                        src="/assets/ctrader.svg"
                        alt="cTrader"
                        className="h-4.5 grayscale opacity-70 shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3">

                    {ninjatraderEnabled && (
                      <>
                        <img
                          src="/assets/ctrader.svg"
                          alt="cTrader"
                          className="h-4.5 grayscale opacity-70 shrink-0"
                        />
                        <img
                          src="/assets/NinjaTrader.png"
                          alt="NinjaTrader"
                          className="h-4.5 translate-y-1 grayscale opacity-70 shrink-0"
                        />
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 max-w-2xl">
                  {description}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600 mb-4">
                  {bullets.map((text) => (
                    <li key={text} className="flex items-start">
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-600" />
                      <p className="ml-2.5">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">

                <div className="mt-3 space-y-2">
                  <div>
                    <button
                      type="button"
                      className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 ${hasDownloadUrl("multi", "windows")
                        ? "cursor-pointer"
                        : "cursor-default opacity-60"
                        }`}
                      onClick={() => handleDownloadClick("multi", "windows")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <WindowsIcon className="h-4 w-4 text-gray-700" />
                          <div>
                            <p className="font-semibold text-gray-700">
                              Download for Windows 64-bit
                            </p>
                          </div>
                        </div>
                        <ArrowDownToLine className="h-4 w-4 text-gray-700" />
                      </div>
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 ${hasDownloadUrl("multi", "mac")
                        ? "cursor-pointer"
                        : "cursor-default opacity-60"
                        }`}
                      onClick={() => handleDownloadClick("multi", "mac")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MacOSIcon className="h-4 w-4 text-gray-700" />
                          <div>
                            <p className="font-semibold text-gray-700">
                              Download for macOS ARM64
                            </p>
                          </div>
                        </div>
                        <ArrowDownToLine className="h-4 w-4 text-gray-700" />
                      </div>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="flex w-full items-center cursor-pointer justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 font-semibold text-red-600 transition-colors hover:bg-gray-50"
                  >
                    <span>Watch demo</span>
                    <Youtube className="h-4 w-4 shrink-0 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className={`order-1 ${imageColClass} relative h-full min-h-[200px] md:min-h-0 overflow-hidden rounded-lg border border-white shadow-lg bg-white`}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-50 text-8xl"  >瞬写 </p>
              </div>
              <img
                src={demoImageSrc}
                className="relative z-10 w-full h-full object-cover"
                onError={() => {
                  setDemoImageSrc("/assets/multi-demo.png");
                }}
              />

            </div>
          </div>
        </div>
      </div>

      {isDemoModalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="IPTRADE Multi demo video"
          onClick={() => setIsDemoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="relative aspect-video w-full">
              {isDemoVideoLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black">
                  <span className="text-2xl text-white animate-midnight-fade">
                    瞬写
                  </span>
                </div>
              )}
              <iframe
                src={getYouTubeEmbedUrl(windowsDemoUrl) ?? undefined}
                title="IPTRADE Multi Demo for Windows"
                className={`h-full w-full rounded-xl transition-opacity duration-200 ${isDemoVideoLoading ? "opacity-0" : "opacity-100"}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setIsDemoVideoLoading(false)}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
