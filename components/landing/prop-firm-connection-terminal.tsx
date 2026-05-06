"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type PropFirmConnectionTerminalProps = {
  className?: string;
};

export function PropFirmConnectionTerminal({ className }: PropFirmConnectionTerminalProps) {
  return (
    <div
      role="alert"
      className={cn(
        "h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white min-h-[250px]  ",
        className
      )}
    >
      <div className="flex flex-col h-full p-5">
        <div className="inline-flex items-center gap-2 w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1.5 mb-4">
          <AlertTriangle className="h-3 w-3 text-red-700" />
          <span className="text-[9px] font-medium text-red-800">Account suspended</span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Account banned — IP restrictions violated
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Your account has been suspended for violating our IP and location rules.
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 space-y-2 mb-4">
          <div className="flex items-baseline gap-2 text-xs">
            <span className="text-gray-500 shrink-0">Case ID</span>
            <span className="text-gray-700">PF-88472</span>
          </div>
          <div className="flex items-baseline gap-2 text-xs">
            <span className="text-gray-500 shrink-0">Violation</span>
            <span className="text-gray-700">Multiple IPs / inconsistent location</span>
          </div>
          <div className="flex items-baseline gap-2 text-xs">
            <span className="text-gray-500 shrink-0">Status</span>
            <span className="text-gray-700">Terminated — compliance hold</span>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Prop firms require a consistent IP (home or dedicated VPS). Switching IPs, VPNs, or trading from multiple locations can result in profit removal or termination.
        </p>

        <p className="text-[10px] text-gray-500 mt-2 italic">
          Example of what prop firms may send when they detect multiple IPs. IPTRADE is designed for one IP, one location—you remain responsible for each firm’s full terms.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
          <span>IP-RESTRICTION-021</span>
          <span>·</span>
          <span>Contact support to appeal</span>
        </div>
      </div>
    </div>
  );
}
