"use client";

import { useState } from "react";
import { DemoWindowChrome } from "@/components/landing/iptrade-window-demo";
import { HistoryProvider } from "@/components/iptrade-app/context/HistoryContext";
import { CalendarView } from "@/components/iptrade-app/history/CalendarView";
import { HistoryFilterHeader } from "@/components/iptrade-app/history/HistoryFilterHeader";
import {
  CalendarCustomizer,
} from "@/components/iptrade-app/history/CalendarCustomizer";
import {
  loadCalendarPreferences,
  saveCalendarPreferences,
  type CalendarPreferences,
} from "@/components/iptrade-app/history/calendarPrefs";
import type { HistoryView } from "@/components/iptrade-app/history/HistoryNav";

interface IpTradeCalendarDemoProps {
  height?: number;
}

export function IpTradeCalendarDemo({ height = 600 }: IpTradeCalendarDemoProps) {
  const [view, setView] = useState<HistoryView>("calendar");
  const [calendarPrefs, setCalendarPrefs] = useState<CalendarPreferences>(loadCalendarPreferences);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const onChangePrefs = (next: CalendarPreferences) => {
    setCalendarPrefs(next);
    saveCalendarPreferences(next);
  };

  return (
    <div className="w-full bg-white flex flex-col" style={{ height }}>
      <DemoWindowChrome
        totalOpenOrders={4}
        totalOrders={6}
        openFlash={null}
        cpuUsagePercent={26}
        ramUsagePercent={42}
        activeView="history-calendar"
      />
      <HistoryProvider>
        <div className="flex flex-1 min-h-0 flex-col">
          <HistoryFilterHeader
            view={view}
            onSelectView={setView}
            onCustomize={() => setCustomizerOpen(true)}
            customizeLabel="Customize calendar"
          />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="relative z-10 h-full">
              <CalendarView onNavigate={setView} prefs={calendarPrefs} />
            </div>
          </div>
        </div>
        <CalendarCustomizer
          open={customizerOpen}
          prefs={calendarPrefs}
          onChange={onChangePrefs}
          onClose={() => setCustomizerOpen(false)}
        />
      </HistoryProvider>
    </div>
  );
}
