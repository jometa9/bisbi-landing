"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DemoWindowChrome } from "@/components/landing/iptrade-window-demo";

const addAccountCardButtonBase =
  "inline-flex items-center justify-center rounded-full bg-black px-3 py-4 text-base text-white transition-all duration-200 hover:bg-gray-600 cursor-pointer";
const addAccountCardButtonClass = cn("mt-4 w-full", addAccountCardButtonBase);
function addAccountCardButtonClassWithDisabled(disabled: boolean) {
  return cn(addAccountCardButtonClass, disabled && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed");
}

const pickGroupClass =
  "mx-auto mt-8 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50";

function AddAccountDetailMt5Demo() {
  const [mt5AccountNumber, setMt5AccountNumber] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Loading] = useState(false);
  const [showMt5Password, setShowMt5Password] = useState(false);
  const [mt5LoginPlaceholderExample] = useState(() => {
    const minuteBucket = Math.floor(Date.now() / 60000);
    return String(minuteBucket).split("").reverse().join("");
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 text-left">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Account number</label>
            <Input
              className="h-9 text-sm bg-gray-50 shadow-none"
              value={mt5AccountNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMt5AccountNumber(e.target.value)}
              placeholder={`e.g. ${mt5LoginPlaceholderExample}`}
              autoComplete="off"
              disabled={mt5Loading}
            />
          </div>
          <div className="min-w-0">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                type={showMt5Password ? "text" : "password"}
                placeholder="••••••••"
                className="h-9 pr-10 text-sm bg-gray-50 shadow-none"
                value={mt5Password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMt5Password(e.target.value)}
                autoComplete="new-password"
                disabled={mt5Loading}
              />
              <button
                type="button"
                aria-label={showMt5Password ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                disabled={mt5Loading}
                onClick={() => setShowMt5Password((v) => !v)}
              >
                {showMt5Password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Server</label>
            <Input
              className="h-9 text-sm bg-gray-50 shadow-none"
              value={mt5Server}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMt5Server(e.target.value)}
              placeholder="e.g. YourBroker-Server-live03"
              autoComplete="off"
              disabled={mt5Loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className={cn(addAccountCardButtonClassWithDisabled(mt5Loading), 'mt-6')}
          disabled={mt5Loading}
        >
          {mt5Loading ? "Verifying connection…" : "Link account"}
        </Button>
      </form>
    </div>
  );
}

function SelectedRowHeader() {
  return (
    <div className="relative flex w-full min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-center border-b border-gray-200">
      <button
        type="button"
        className="absolute top-3 right-3 inline-flex cursor-pointer items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
        aria-label="Change platform"
        tabIndex={-1}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Change
      </button>
      <div className="flex min-w-0 flex-1 flex-col text-left items-start">
        <img
          src="/assets/metatrader5headless.png"
          alt=""
          aria-hidden
          className="h-8 -ml-1 -mt-1 mb-3 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/metatrader5.png"; }}
        />
        <h3 className="text-lg font-semibold text-gray-900">MetaTrader 5</h3>
        <p className="mt-1 text-sm text-gray-600">
          No MetaTrader installation required — connect directly with your account credentials.
        </p>
      </div>
    </div>
  );
}

function AddAccountFlowDemo() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-8 text-gray-600 pb-24">
      <p className="text-lg font-semibold text-gray-900">Add accounts</p>
      <div className="mt-2 text-sm text-gray-600 max-w-lg text-center">
        Finish the steps below—then your accounts will show in the list.
      </div>

      <div className={pickGroupClass}>
        <SelectedRowHeader />
        <div className="bg-white p-5">
          <AddAccountDetailMt5Demo />
        </div>
      </div>
    </div>
  );
}

interface Mt5DirectSectionProps {
  demoSide?: "left" | "right";
}

export function Mt5DirectSection({ demoSide = "right" }: Mt5DirectSectionProps = {}) {
  const isDemoLeft = demoSide === "left";
  const gridColsClass = isDemoLeft
    ? "xl:grid-cols-[60%_40%]"
    : "xl:grid-cols-[40%_60%]";
  const textOrderClass = isDemoLeft ? "xl:order-2" : "xl:order-1";
  const demoOrderClass = isDemoLeft ? "xl:order-1" : "xl:order-2";
  const demoAlignClass = isDemoLeft ? "xl:justify-end" : "";

  return (
    <section id="mt5-direct" className="scroll-mt-24">
      <div className="px-3 max-w-7xl mx-auto">
        <div className="flex flex-col gap-12 rounded-lg bg-[#03618d] p-6 overflow-hidden">
          <div className={cn("grid grid-cols-1 gap-0 xl:gap-8", gridColsClass)}>

            <div className={cn("order-1 min-w-0 pb-6 xl:pb-0 xl:px-6", textOrderClass)}>
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-white">
                  Connect MT5 without opening the platform
                </h3>
              </div>
              <p className="text-lg text-white mb-3">No terminal. No Expert Advisor.</p>
              <p className="text-gray-200 mb-8">
                Most trade copiers require MetaTrader 5 to be installed, open, and an Expert Advisor
                running on a chart. With IPTRADE, you connect MT5 accounts directly—just enter your
                broker login, server name, and password. IPTRADE authenticates directly with the MT5
                server. No open platform, no EA slot consumed, no DLL permissions required.
                Works with any broker or prop firm.
              </p>
              <Link
                  href="/dashboard"
                  className=" inline-block rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 shadow-none hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Try MT5 Direct Connection
                </Link>
            </div>

            <div className={cn("order-2 pt-6 xl:pt-0 min-w-0", demoOrderClass)}>
              <div className={cn("flex p-3-m-4", demoAlignClass)}>
                <div className="bg-white w-[700px] md:w-[900px] rounded-lg relative transition-transform duration-0 border border-gray-200 z-10 shadow-lg shrink-0 overflow-hidden">
                  <DemoWindowChrome
                    totalOpenOrders={0}
                    totalOrders={0}
                    openFlash={null}
                    cpuUsagePercent={18}
                    ramUsagePercent={36}
                    activeView="add"
                  />
                  <AddAccountFlowDemo />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
