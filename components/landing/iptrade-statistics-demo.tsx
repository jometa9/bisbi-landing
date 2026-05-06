"use client";

import { useState } from "react";
import { DemoWindowChrome } from "@/components/landing/iptrade-window-demo";
import { HistoryProvider } from "@/components/iptrade-app/context/HistoryContext";
import { StatisticsView } from "@/components/iptrade-app/history/StatisticsView";
import { HistoryFilterHeader } from "@/components/iptrade-app/history/HistoryFilterHeader";
import {
  loadStatsPreferences,
  type StatsPreferences,
} from "@/components/iptrade-app/history/statisticsPrefs";
import type { HistoryView } from "@/components/iptrade-app/history/HistoryNav";

interface IpTradeStatisticsDemoProps {
  height?: number;
}

export function IpTradeStatisticsDemo({ height = 700 }: IpTradeStatisticsDemoProps) {
  const [view, setView] = useState<HistoryView>("statistics");
  const [statsPrefs] = useState<StatsPreferences>(loadStatsPreferences);

  // `inert` disables all user interaction (clicks, focus, scroll, keyboard)
  // while leaving CSS :hover styles working — the demo stays visually
  // alive but no button fires actions and the user can't scroll inside it.
  return (
    <div className="w-full bg-white flex flex-col" style={{ height }} inert>
      <DemoWindowChrome
        totalOpenOrders={4}
        totalOrders={6}
        openFlash={null}
        cpuUsagePercent={28}
        ramUsagePercent={44}
        activeView="history-statistics"
      />
      <HistoryProvider>
        <div className="flex flex-1 min-h-0 flex-col">
          <HistoryFilterHeader view={view} onSelectView={setView} />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="relative z-10 h-full">
              <StatisticsView prefs={statsPrefs} />
            </div>
          </div>
        </div>
      </HistoryProvider>
    </div>
  );
}
