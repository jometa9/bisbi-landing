"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/layout/footer";
import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { signIn } from "next-auth/react";
import Image from "next/image";

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

  const base =
    variant === "hero"
      ? "inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-colors text-white"
      : "inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium transition-colors text-white";

  return (
    <button
      onClick={() => handleDownload()}
      className={base}
      style={{ backgroundColor: "#7BA89C" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5A8C83";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7BA89C";
      }}
    >
      {t.nav.downloadFree}
    </button>
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
              <div
                className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2"
                style={{ backgroundColor: "#E6EFED" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#7BA89C" }}
                >
                  {t.languagesSection.moreCount}
                </span>
                <span className="text-base font-medium" style={{ color: "#1A1A18" }}>
                  {t.languagesSection.moreLabel}
                </span>
              </div>
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
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="underline underline-offset-2"
                style={{ color: "#7BA89C" }}
              >
                {t.cta.signIn}
              </button>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
