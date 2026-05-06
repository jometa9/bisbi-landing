"use client";


import { cn } from "@/lib/utils";
import { ninjatraderEnabled } from "@/lib/payments/feature-flag";

interface AddAccountsPickDemoProps {
  isWindows?: boolean;
}

const pickGroupClass =
  "mx-auto mt-8 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50";

const pickConnectionRowClass =
  "group flex w-full min-w-0 items-center gap-4 p-5 transition-colors hover:bg-gray-100 cursor-pointer disabled:opacity-60";

function CtraderIcon() {
  return (
    <img
      src="/assets/ctrader.svg"
      alt=""
      aria-hidden
      className="mb-4 h-5.5"
    />
  );
}

function Mt5HeadlessIcon() {
  return (
    <img
      src="/assets/metatrader5headless.png"
      alt=""
      aria-hidden
      className="mb-3 h-7.5 w-auto self-end"
    />
  );
}

function MtExpertIcon() {
  return (
    <div className="mb-3 flex items-center gap-3 self-end">
      <img
        src="/assets/metatrader4.png"
        alt=""
        aria-hidden
        className="-mr-1 -mt-1 h-7"
      />
      <img
        src="/assets/metatrader5.png"
        alt=""
        aria-hidden
        className="-mt-1 h-7"
      />
    </div>
  );
}

function NinjaTraderIcon() {
  return (
    <img
      src="/assets/NinjaTrader.png"
      alt=""
      aria-hidden
      className="mb-3 h-4 w-auto self-end object-contain"
    />
  );
}

export function AddAccountsPickDemo({
  isWindows = true,
}: AddAccountsPickDemoProps) {
  return (
    <div className="relative flex min-h-full w-full flex-col items-stretch justify-center px-4 py-8 pb-16 text-gray-600 md:items-center">
      <div className="w-full max-w-2xl text-right md:mx-auto md:text-center">
        <p className="text-lg font-semibold text-gray-900">Add accounts</p>
        <p className="mt-2 text-right text-sm text-gray-600 md:mx-auto md:max-w-lg md:text-center">
          What platform do you use?
        </p>
      </div>
      <div className={cn(pickGroupClass, !isWindows ? "mb-16" : "mb-6")}>
        <button
          type="button"
          className={cn(pickConnectionRowClass, "w-full border-b border-gray-200")}
          aria-label="Continue with MetaTrader 5 Headless"
        >
          <div className="flex min-w-0 flex-1 flex-col items-end text-right">
            <Mt5HeadlessIcon />
            <h3 className="text-lg font-semibold text-gray-900">
              MetaTrader 5
            </h3>
            <p className="mt-1 text-xs text-gray-600 max-w-[300px]">
              No MetaTrader installation required - connect directly with your
              account credentials.
            </p>
          </div>
        </button>
        <div className="flex flex-col md:flex-row">
          <button
            type="button"
            className={cn(
              pickConnectionRowClass,
              "border-b border-gray-200 md:border-r md:border-b-0"
            )}
            aria-label="Continue with cTrader"
          >
 
            <div className="flex min-w-0 flex-1 flex-col items-end text-right">
              <CtraderIcon />
              <h3 className="text-lg font-semibold text-gray-900">cTrader</h3>
              <p className="mt-1 text-xs text-gray-600 max-w-[300px]">
                Sign in through your browser - accounts link automatically.
              </p>
            </div>
          </button>
          <button
            type="button"
            className={cn(
              pickConnectionRowClass,
              ninjatraderEnabled ? "border-b border-gray-200 md:border-b-0" : ""
            )}
            aria-label="Continue with MetaTrader expert advisor"
          >
           
            <div className="flex min-w-0 flex-1 flex-col items-end text-right">
              <MtExpertIcon />
              <h3 className="text-lg font-semibold text-gray-900">
                MetaTrader 4 & 5
              </h3>
              <p className="mt-1 text-xs text-gray-600 max-w-[300px]">
                Requires MetaTrader installed and open - installs the IPTRADE
                Expert Advisor in each platform.
              </p>
            </div>
          </button>
        </div>
        {ninjatraderEnabled && (
          <button
            type="button"
            className={cn(pickConnectionRowClass, "w-full")}
            aria-label="Continue with NinjaTrader"
          >
    
            <div className="flex min-w-0 flex-1 flex-col items-end text-right">
              <NinjaTraderIcon />
              <h3 className="text-lg font-semibold text-gray-900">NinjaTrader</h3>
              <p className="mt-1 text-xs text-gray-600 max-w-[200px] md:max-w-sm">
                Requires NinjaTrader installed — use the IPTRADE add-on inside the
                platform to connect your accounts.
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
