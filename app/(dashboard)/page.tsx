"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { ProductDemo } from "@/components/landing/product-demo";
import { WindowsDemo } from "@/components/landing/windows-demo";
import { Footer } from "@/components/layout/footer";
import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { signIn } from "next-auth/react";
import Image from "next/image";

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
      <main style={{ backgroundColor: "#FFFFFF" }}>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/assets/bisbi.png"
              alt="Bisbi"
              width={96}
              height={96}
              priority
            />
          </div>

          <h1
            className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight"
            style={{ color: "#1A1A18" }}
          >
            {t.hero.headline1}
            <span className="block">
              <span className="hero-highlight" style={{ color: "#7BA89C" }}>
                {t.hero.headline2}
              </span>
            </span>
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

        {/* Live product demo — frozen on Home, Pro plan, fully static */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
          <WindowsDemo />
        </section>

        {/* How it works — full body width, no wrapping card */}
        <section
          id="how-it-works"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24"
        >
          <p
            className="text-sm font-medium text-center mb-3 uppercase tracking-widest"
            style={{ color: "#7BA89C" }}
          >
            {t.howItWorks.badge}
          </p>
          <h2
            className="text-3xl md:text-5xl font-semibold text-center mb-16 md:mb-20"
            style={{ color: "#1A1A18" }}
          >
            {t.howItWorks.title}
          </h2>

          <ProductDemo />
        </section>

        {/* Bloques (cards) sobre el fondo beige */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 pb-12">
          {/* Features */}
          <section
            id="features"
            className="rounded-3xl py-16 md:py-20 px-6 sm:px-10 md:px-16 border"
            style={{ borderColor: "#EAE6DC" }}
          >
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
                  style={{ backgroundColor: "#F0EDE6" }}
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
          </section>
        </div>

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
