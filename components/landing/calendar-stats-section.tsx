"use client";

import { IpTradeCalendarDemo } from "@/components/landing/iptrade-calendar-demo";
import { IpTradeStatisticsDemo } from "@/components/landing/iptrade-statistics-demo";

export function CalendarStatsSection() {
  return (
    <section id="calendar-stats" className="scroll-mt-24">
      <div className="px-3 max-w-7xl mx-auto">
        <div className="flex flex-col gap-12 rounded-lg bg-indigo-800 p-6 overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-0 xl:gap-8">
            <div className="order-2 xl:order-1 pt-6 xl:pt-0 min-w-0">
              <div className="flex justify-end p-3-m-4">
                <div className="demo-desktop-layout bg-white w-[900px] rounded-lg relative transition-transform duration-0 border border-gray-200 z-10 shadow-lg shrink-0 overflow-hidden">
                  <IpTradeCalendarDemo height={560} />
                </div>
              </div>
            </div>

            <div className="order-1 xl:order-2 min-w-0 xl:px-6 pb-6 xl:pb-0">
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-white">
                  See every trading day at a glance
                </h3>
              </div>
              <p className="text-lg text-white mb-3">
                Your trading month, mapped in colour.
              </p>
              <p className="text-gray-200 mb-8">
                IPTRADE turns your closed trades into a calendar heatmap so you
                instantly know which days printed money and which ones bled. Drill
                from year → quarter → month → week → day, choose the metrics you
                care about (net PnL, win rate, best/worst trade, volume), and click
                any cell to jump straight into the orders or statistics for that
                period. All built-in. No external journal needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[40%_60%] gap-0 xl:gap-8">
            <div className="order-1 xl:order-1 min-w-0 xl:px-6 pb-6 xl:pb-0">
              <div className="mb-6 mt-6">
                <h3 className="text-4xl text-white">
                  Performance analytics that actually grade you
                </h3>
              </div>
              <p className="text-lg text-white mb-3">
                Your PnL, your discipline, your rhythm — all in one screen.
              </p>
              <p className="text-gray-200 mb-8">
                Net PnL, win rate, profit factor, drawdown, expectancy, Sharpe,
                streaks, equity curve, daily bars, symbol distribution — and an
                IPTRADE Score that rolls everything into a single grade so you
                know if you're trending up or sliding. Filter by date range, by
                account or by symbol. All computed on your machine across every
                master and slave you copy.
              </p>
            </div>

            <div className="order-2 xl:order-2 pt-6 xl:pt-0 min-w-0">
              <div className="flex p-3-m-4">
                <div className="demo-desktop-layout bg-white w-[900px] rounded-lg relative transition-transform duration-0 border border-gray-200 z-10 shadow-lg shrink-0 overflow-hidden">
                  <IpTradeStatisticsDemo height={620} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
