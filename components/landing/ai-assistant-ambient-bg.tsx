"use client";

import { BackgroundGradientAnimation } from "@/components/landing/background-gradient-animation";

export type AIAssistantAmbientBgVariant = "section" | "card";

export function AIAssistantAmbientBg({
  variant,
}: {
  variant: AIAssistantAmbientBgVariant;
}) {
  const card = variant === "card";

  return (
    <>
      <BackgroundGradientAnimation
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        size={card ? "72%" : "88%"}
        blendingValue="darken"
      />
      <div className="pointer-events-none absolute inset-0 z-1 bg-gray-800/42 backdrop-blur-md transition-colors duration-300 group-hover:bg-gray-800/35" />
    </>
  );
}
