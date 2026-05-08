"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { ProductDemo, RecordingPill } from "@/components/landing/product-demo";
import { AppDemo } from "@/components/landing/app-demo";
import { DocsDemo } from "@/components/landing/docs-demo";
import { SpeedComparison } from "@/components/landing/speed-comparison";
import { SocialProof } from "@/components/landing/social-proof";
import { Footer } from "@/components/layout/footer";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const featureWatermarks = [
  <svg key="app" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>,
  <svg key="mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>,
  <svg key="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  <svg key="monitor" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
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
  const router = useRouter();

  const base =
    variant === "hero"
      ? "inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-colors text-white cursor-pointer"
      : "inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium transition-colors text-white cursor-pointer";

  return (
    <button
      onClick={() => router.push("/dashboard")}
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

function CtaTitle({ title, highlight }: { title: string; highlight: string }) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <h2
      ref={ref}
      className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-[1.05]"
      style={{ color: "#1A1A18" }}
    >
      {title}
      <span className="block">
        <span className={`cta-highlight${active ? " cta-highlight--active" : ""}`}>
          {highlight}
        </span>
      </span>
    </h2>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  const docsRef = useRef<HTMLElement | null>(null);
  const [docsInView, setDocsInView] = useState(false);

  useEffect(() => {
    const el = docsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setDocsInView(e.isIntersecting);
      },
      { threshold: 0, rootMargin: "-20% 0px -20% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <LandingHeader />
      <main style={{ backgroundColor: "#FFFFFF" }}>

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
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-[1.05]"
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

        <section
          ref={docsRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        >
          <DocsDemo />
        </section>

        <section
          id="how-it-works"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        >
          <ProductDemo />
        </section>

        <section
          id="speed"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        >
          <SpeedComparison />
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <AppDemo />
        </section>

        <section
          id="features"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        >
          <div className="feature-grid">
            {t.features.items.map((feature, i) => (
              <div
                key={i}
                className={`feature-card${i % 2 === 1 ? " feature-card--tint" : ""}`}
              >
                <div className="feature-card-watermark" aria-hidden="true">
                  {featureWatermarks[i]}
                </div>
                <div className="feature-card-content">
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-desc">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="social-proof"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        >
          <SocialProof />
        </section>

        <section className="py-8 md:py-12 pt-16 md:pt-24" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center mb-6">
              <Image src="/owl_head.svg" alt="Bisbi" width={56} height={56} />
            </div>
            <CtaTitle title={t.cta.title} highlight={t.cta.titleHighlight} />
            <p
              className="text-lg mb-10 max-w-md mx-auto"
              style={{ color: "#5C5C57" }}
            >
              {t.cta.description}
            </p>

            <div className="flex justify-center mb-3">
              <DownloadButtons variant="cta" />
            </div>

            <p className="text-sm" style={{ color: "#A8A8A2" }}>
              {t.cta.freeBadge}
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <div
        aria-hidden={docsInView}
        style={{
          opacity: docsInView ? 0 : 1,
          pointerEvents: docsInView ? "none" : "auto",
          transition: "opacity 240ms ease",
        }}
      >
        <RecordingPill floating />
      </div>
    </>
  );
}
