"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/layout/footer";
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
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className={base}
      style={{ backgroundColor: "#7BA89C" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5A8C83";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7BA89C";
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
      </svg>
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
