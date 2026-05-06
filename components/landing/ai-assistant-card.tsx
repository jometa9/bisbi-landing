"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { AIAssistantAmbientBg } from "@/components/landing/ai-assistant-ambient-bg";

export function AIAssistantCard() {
  return (
    <Link href="/assistant" className="block">
      <div className="group relative overflow-hidden rounded-lg bg-gray-800 p-6 py-12 hover:bg-gray-750 transition-colors cursor-pointer">
        <AIAssistantAmbientBg variant="card" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Sparkles className="w-8 h-8 text-white mb-6" />

          <h3 className="text-2xl font-semibold text-white mb-2">
            Got questions?
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Our AI assistant knows everything about IPTRADE.
            <br />
            Get instant answers.
          </p>

          <div >
            <div className="relative flex items-center justify-center p-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 gap-3">
              <div className="px-4 py-1.5 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Ask Ugo
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Compliance", "Setup", "Features"].map((chip) => (
              <div
                key={chip}
                className="px-3 py-1.5 text-xs text-gray-200/90 border border-white/15 bg-white/5 rounded-full hover:bg-white/12 hover:border-white/25 hover:text-white transition-all"
              >
                {chip}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Free for all users
          </p>
        </div>
      </div>
    </Link>
  );
}
