"use client";

import {
  Globe,
  Shield,
  UserCheck,
  Waypoints,
  Server,
  CalendarDays,
} from "lucide-react";
import { PropFirmLogosScroll } from "@/components/landing/prop-firm-logos-scroll";
import Link from "next/link";
import { useCallback, type MouseEvent } from "react";

export function FeaturesSection() {
  const handleHashLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.includes("#")) {
        return;
      }

      event.preventDefault();
      const targetId = href.split("#")[1];

      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState({}, "", `/#${targetId}`);
      } else {
        const attemptScroll = (attempts = 0) => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            window.history.replaceState({}, "", `/#${targetId}`);
          } else if (attempts < 10) {
            setTimeout(() => attemptScroll(attempts + 1), 100);
          }
        };
        attemptScroll();
      }
    },
    []
  );
  return (
    <section id="features" className="scroll-mt-24">
      <div className="px-3 max-w-7xl mx-auto">
        <p className="text-gray-600 text-xl mb-1">Features</p>
        <h2 className="text-3xl text-gray-900 mb-6">
          Control and speed—all on your computer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto">

          <Link
            href="#mt5-direct"
            onClick={(e) => handleHashLinkClick(e, "#mt5-direct")}
            className="md:col-span-2 relative flex flex-col pt-18 pb-8 p-6 bg-[#03618d] hover:bg-[#024a6b] rounded-lg overflow-hidden transition-colors cursor-pointer"
          >
            <div className="relative z-10">
              <Server className="h-6 w-6 text-white mb-3" />
              <h3 className="text-2xl mb-2 text-white">MT5 Direct Connection</h3>
              <p className="text-gray-200 text-sm mb-4">
                Connect MetaTrader 5 accounts without the terminal installed or open, and without any Expert Advisor.
                Just enter your credentials—IPTRADE connects directly to the MT5 server. No open platform, no EA slot used.
              </p>
              <div>
                <div className="mt-4 inline-block rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 shadow-none transition-colors">
                  Learn more
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-900 text-white rounded-lg">
            <UserCheck className="h-6 w-6 text-gray-200 mb-3" />
            <h3 className="text-2xl mb-2">Single IP Address</h3>
            <p className="text-gray-200 text-sm">
              All your accounts operate from a single IP address. IPTRADE Multi is designed
              to help you meet typical prop firm IP restrictions and professional trading setups.
              Our local products keep one IP for all connections—you remain responsible for each prop firm's full terms.
            </p>
          </div>

          <Link href="/prop-firms" className="md:col-span-1 relative flex flex-col pt-18 pb-8 p-6 rounded-lg overflow-hidden hover:bg-green-900 transition-colors cursor-pointer bg-green-800">
            <div className="relative z-10">
              <Waypoints className="h-6 w-6 text-white mb-3" />
              <h3 className="text-2xl mb-3 text-white">Built for Prop Firms</h3>
              <p className="text-gray-200 text-sm mb-4">
                Trade multiple prop firm challenges from one machine. Everything runs locally with a single IP
                and zero data exposure—designed to help you meet typical IP restrictions. Other prop firm rules
                vary by firm; check each firm's terms and do your own research before using our tool.
              </p>
              <div>
                <div className="mt-4 inline-block rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-xs text-gray-900 shadow-none hover:bg-gray-200 transition-colors">
                  Learn how to use IPTRADE with prop firms
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg md:col-span-2 overflow-hidden">
            <PropFirmLogosScroll />
          </div>

          <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-400 rounded-lg">
            <Shield className="h-6 w-6 text-white mb-3" />
            <h3 className="text-2xl text-white mb-2">
              Complete Privacy & Security
            </h3>
            <p className="text-gray-100 text-sm">
              Your trading strategies stay yours alone. Everything processes
              on your machine with zero external data storage. Complete privacy—your competitive edge
              remains protected.
            </p>
          </div>

          <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-900 rounded-lg">
            <Globe className="h-6 w-6 text-gray-200 mb-3" />
            <h3 className="text-2xl text-white mb-2">
              Multi-Platform Trading Support
            </h3>
            <p className="text-gray-200 text-sm">
              MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS—all
              from one powerful solution. Copy trades between different platforms
              and brokers effortlessly. Switch between trading platforms without
              losing performance or the single IP advantage.
            </p>
          </div>

          <Link
            href="#calendar-stats"
            onClick={(e) => handleHashLinkClick(e, "#calendar-stats")}
            className="md:col-span-1 flex flex-col pt-18 pb-8 p-6 rounded-lg bg-indigo-800 hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <CalendarDays className="h-6 w-6 text-gray-200 mb-3" />
            <h3 className="text-2xl mb-2 text-white">
              Built-in Calendar & Performance Analytics
            </h3>
            <p className="text-gray-200 text-sm mb-4">
              Track every trading day in a colour-coded calendar, drill from year
              to day, and surface KPIs like net PnL, win rate, profit factor,
              drawdown, expectancy and Sharpe—plus an IPTRADE Score that grades
              your discipline. Everything runs locally on your machine, included
              in every plan at no extra cost.
            </p>
            <div>
              <div className="mt-4 inline-block rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 shadow-none hover:bg-gray-200 transition-colors">
                See the calendar & stats
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
