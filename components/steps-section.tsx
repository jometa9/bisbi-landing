"use client";

import { IpTradeWindowDemo } from "@/components/landing/iptrade-window-demo";
import { Blocks, ArrowDownToLine } from "lucide-react";
import { ProductKey } from "@/lib/db/schema";
import {
  DownloadOS,
  detectOS,
  fetchAllDownloads,
  handleDownload,
} from "@/lib/download-handler";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { MacOSIcon } from "@/components/icons/macos-icon";
import { useEffect, useState } from "react";

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

export function StepsSection() {
  const [downloads, setDownloads] = useState<AllDownloads | null>(null);
  const [userOS, setUserOS] = useState<DownloadOS>("windows");

  useEffect(() => {
    const loadDownloads = async () => {
      const data = await fetchAllDownloads();
      setDownloads(data);
    };

    loadDownloads();
    setUserOS(detectOS());
  }, []);

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

  const getExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const expirationDate = getExpirationDate();

  return (
    <section id="setup" className="overflow-x-hidden scroll-mt-24">
      <div className="px-3 max-w-7xl mx-auto">
        <p className="text-gray-600 text-xl mb-1">Get started</p>
        <h2 className="text-6xl text-gray-900 mb-6">Setup in 3 minutes</h2>

        <div data-step="1" className="rounded-lg bg-gray-100 p-6 mb-6 max-w-full overflow-x-hidden box-border">
          <div className="grid grid-cols-1 xl:grid-cols-[40%_1fr] gap-8">
            <div className="order-1 xl:order-1 min-w-0 xl:pr-6 pb-6 xl:pb-0">
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-gray-900">Download the app</h3>
              </div>
              <p className="text-gray-600 mb-8">
                Start with IPTRADE by downloading our desktop application
                for maximum control and speed. Everything runs on your computer
                with zero external dependencies.
              </p>
            </div>

            <div className="order-2 xl:order-2 min-w-0 xl:w-full">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 w-[500px] sm:w-full sm:min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Blocks className="w-4 h-4 shrink-0" />
                  <span className="text-lg text-gray-700">IPTRADE Multi</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Local copy — Windows (MT4, MT5, cTrader) & macOS (MT5 direct & cTrader)</p>
                <p className="text-xl font-semibold mb-2">Unlimited</p>
                <p className="text-xs text-muted-foreground">Status: Active</p>
                <p className="text-xs text-muted-foreground">Billing: Annual</p>
                <p className="text-xs text-muted-foreground mb-4">Expires: {expirationDate}</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    className={`w-full cursor-pointer rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between gap-2 bg-gray-50 hover:bg-white transition-colors text-left ${
                      hasDownloadUrl("multi", "windows") ? "" : "opacity-60 cursor-default"
                    }`}
                    onClick={() => handleDownloadClick("multi", "windows")}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <WindowsIcon className="h-4 w-4 shrink-0 text-black" />
                      <span className="text-xs font-medium text-gray-700">Download for Windows 64-bit</span>
                    </span>
                    <ArrowDownToLine className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    className={`w-full cursor-pointer rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between gap-2 bg-gray-50 hover:bg-white transition-colors text-left ${
                      hasDownloadUrl("multi", "mac") ? "" : "opacity-60 cursor-default"
                    }`}
                    onClick={() => handleDownloadClick("multi", "mac")}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <MacOSIcon className="h-4 w-4 shrink-0 text-black" />
                      <span className="text-xs font-medium text-gray-700">Download for macOS ARM64</span>
                    </span>
                    <ArrowDownToLine className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          data-step="2"
          className="flex flex-col gap-12 rounded-lg bg-gray-400 p-6 mb-6 overflow-hidden scroll-hidden"
        >
          <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-8">
            <div className="order-2 xl:order-1 pt-6 xl:pt-0 min-w-0">
              <div className="flex justify-end p-3-m-4">
                <div className="bg-white w-[700px] md:w-[900px]  rounded-lg relative transition-transform duration-0 border border-gray-200 z-10 shadow-lg shrink-0">
                  <IpTradeWindowDemo initialViewState="add-accounts" />
                </div>
              </div>
            </div>

            <div className="order-1 xl:order-2 xl:pl-6 xl:pr-10 pb-6 xl:pb-0">
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-white">Connect your accounts</h3>
              </div>
              <p className="text-lg text-white mb-2">Choose your platform</p>
              <p className="text-gray-200 mb-8">
                Link your trading accounts on MetaTrader 4, MetaTrader 5,
                or cTrader. IPTRADE guides you through a simple authorization
                process—just follow the prompts, and your accounts will appear
                ready to configure.
              </p>
            </div>
          </div>
        </div>

        <div
          data-step="3"
          className="flex flex-col gap-12 rounded-lg bg-gray-900 p-6 mb-6 overflow-hidden"
        >
          <div className="grid grid-cols-1 xl:grid-cols-[40%_60%] gap-8">
            <div className="order-1 xl:order-1 xl:pr-6 pb-6 xl:pb-0">
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-white">Start copying trades</h3>
              </div>
              <p className="text-gray-200 mb-8">
                Configure your master and slave accounts, set your preferred
                multipliers and lot sizes, and activate copy trading. Once
                configured, IPTRADE automatically replicates every trade in
                real-time across all your connected accounts—no manual
                intervention needed.
              </p>
            </div>

            <div className="order-2 xl:order-2 pt-6 xl:pt-0 min-w-0">
              <div className="flex xl:ml-auto p-3-m-4">
                <div className="bg-white w-[600px] md:w-[800px] h-[600px] rounded-lg relative transition-transform duration-0 overflow-hidden border border-gray-200 z-10 shadow-lg shrink-0">
                  <IpTradeWindowDemo 
                    initialViewState="accounts"
                    initialExpandedGroups={{
                      "master-1": true,
                      "master-2": false,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
