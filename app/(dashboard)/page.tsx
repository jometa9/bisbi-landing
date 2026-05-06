"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/layout/footer";
import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type OS = "mac" | "windows" | "unknown";

function detectOS(): OS {
  if (typeof window === "undefined") return "unknown";
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "unknown";
}

const LANG_CODES = ["EN", "ES", "PT", "FR", "IT", "DE", "ZH", "HI", "AR"] as const;

const featureIcons = [
  // any app
  <svg key="app" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>,
  // mic
  <svg key="mic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>,
  // globe
  <svg key="globe" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  // translate
  <svg key="translate" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 8l6 6 6-6" />
    <path d="M4 6h16M4 18h7" />
    <path d="M15 15l3 3 3-3" />
    <path d="M18 18V12" />
  </svg>,
  // lock
  <svg key="lock" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
  // monitor
  <svg key="monitor" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h4M7 11h2" />
    <rect x="13" y="7" width="6" height="6" rx="1" />
  </svg>,
];

function DownloadButtons({
  variant = "hero",
}: {
  variant?: "hero" | "cta";
}) {
  const { t } = useI18n();
  const [os, setOS] = useState<OS>("unknown");
  const [downloading, setDownloading] = useState<"mac" | "windows" | null>(null);

  useEffect(() => {
    setOS(detectOS());
  }, []);

  const showMac = os === "mac" || os === "unknown";
  const showWin = os === "windows" || os === "unknown";

  const handleClick = async (platform: "mac" | "windows") => {
    setDownloading(platform);
    await handleDownload("multi", platform);
    setTimeout(() => setDownloading(null), 3000);
  };

  const base =
    variant === "hero"
      ? "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
      : "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-3">
      {showMac && (
        <button
          onClick={() => handleClick("mac")}
          disabled={downloading !== null}
          className={`${base} text-white disabled:opacity-70`}
          style={{ backgroundColor: "#7BA89C" }}
          onMouseEnter={(e) => {
            if (!downloading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5A8C83";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7BA89C";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          {downloading === "mac" ? t.download.starting : t.download.mac}
        </button>
      )}
      {showWin && (
        <button
          onClick={() => handleClick("windows")}
          disabled={downloading !== null}
          className={`${base} disabled:opacity-70`}
          style={{
            backgroundColor: showMac ? "#E6EFED" : "#7BA89C",
            color: showMac ? "#1A1A18" : "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            if (!downloading)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                showMac ? "#D9E8E5" : "#5A8C83";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              showMac ? "#E6EFED" : "#7BA89C";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12V6.75l6-1.32v6.57H3zM20 3v8.75h-8V5.05L20 3zM3 13h6v6.43l-6-1.43V13zm17 0v8.75l-8-2V13h8z" />
          </svg>
          {downloading === "windows" ? t.download.starting : t.download.windows}
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <LandingHeader />
      <main style={{ backgroundColor: "#F0EDE6" }}>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-2xl p-4" style={{ backgroundColor: "#E6EFED" }}>
              <Image src="/owl_head.svg" alt="Bisbi owl" width={48} height={48} />
            </div>
          </div>

          <h1
            className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight"
            style={{ color: "#1A1A18" }}
          >
            {t.hero.headline1}{" "}
            <span style={{ color: "#7BA89C" }}>{t.hero.headline2}</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#5C5C57" }}
          >
            {t.hero.subheadline}
          </p>

          <div className="flex justify-center">
            <DownloadButtons variant="hero" />
          </div>

          <p className="mt-5 text-sm" style={{ color: "#A8A8A2" }}>
            {t.hero.freeBadge}
          </p>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto px-6">
            <p
              className="text-sm font-medium text-center mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.howItWorks.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-center mb-16"
              style={{ color: "#1A1A18" }}
            >
              {t.howItWorks.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {t.howItWorks.steps.map((step, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: "#F0EDE6" }}
                >
                  <div
                    className="text-4xl font-bold mb-4"
                    style={{ color: "#D9E8E5" }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#1A1A18" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5C5C57" }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24" style={{ backgroundColor: "#F0EDE6" }}>
          <div className="max-w-5xl mx-auto px-6">
            <p
              className="text-sm font-medium text-center mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.features.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-center mb-16"
              style={{ color: "#1A1A18" }}
            >
              {t.features.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="mb-4 inline-flex rounded-xl p-2"
                    style={{ backgroundColor: "#E6EFED", color: "#7BA89C" }}
                  >
                    {featureIcons[i]}
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "#1A1A18" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5C5C57" }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Languages */}
        <section id="languages" className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p
              className="text-sm font-medium mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.languagesSection.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold mb-6"
              style={{ color: "#1A1A18" }}
            >
              {t.languagesSection.title}
            </h2>
            <p
              className="text-lg mb-12 max-w-lg mx-auto"
              style={{ color: "#5C5C57" }}
            >
              {t.languagesSection.subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {LANG_CODES.map((code, i) => (
                <div
                  key={code}
                  className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2"
                  style={{ backgroundColor: "#F0EDE6" }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#7BA89C" }}
                  >
                    {code}
                  </span>
                  <span className="text-base font-medium" style={{ color: "#1A1A18" }}>
                    {t.languagesSection.names[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="flex justify-center mb-6">
              <Image src="/owl_head.svg" alt="Bisbi" width={36} height={36} />
            </div>
            <h2
              className="text-3xl md:text-4xl font-semibold mb-4"
              style={{ color: "#1A1A18" }}
            >
              {t.cta.title}
            </h2>
            <p
              className="text-lg mb-10 max-w-md mx-auto"
              style={{ color: "#5C5C57" }}
            >
              {t.cta.description}
            </p>

            <div className="flex justify-center mb-6">
              <DownloadButtons variant="cta" />
            </div>

            <p className="text-sm" style={{ color: "#A8A8A2" }}>
              {t.cta.signInHint}{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-2"
                style={{ color: "#7BA89C" }}
              >
                {t.cta.signIn}
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
