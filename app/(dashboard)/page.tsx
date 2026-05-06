"use client";

import { MacOSIcon } from "@/components/icons/macos-icon";
import { WindowsIcon } from "@/components/icons/windows-icon";
import { AIQuestionSection } from "@/components/landing/ai-question-section";
import { CallToActionSection } from "@/components/landing/call-to-action-section";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Mt5DirectSection } from "@/components/landing/mt5-direct-section";
import { CalendarStatsSection } from "@/components/landing/calendar-stats-section";
import { FounderCard } from "@/components/landing/founder-card";
import { IpTradeWindowDemo } from "@/components/landing/iptrade-window-demo";
import { LandingHeader } from "@/components/landing/landing-header";
import { ProductsSection } from "@/components/landing/products-section";
import { SupportedPlatformsRow } from "@/components/landing/supported-platforms-row";
import TradingViewBackground from "@/components/landing/trading-view-background";
import { Footer } from "@/components/layout/footer";
import { useMetaPixel } from "@/components/meta-pixel";
import { PricingSection } from "@/components/pricing-section";
import { StepsSection } from "@/components/steps-section";
import { StructuredData } from "@/components/structured-data";
import { Testimonials } from "@/components/testimonials";
import { Button } from "@/components/ui/button";
import { handleDownload } from "@/lib/download-handler";
import { ArrowRight } from "lucide-react";
import { Suspense, useEffect, useState, useCallback, type MouseEvent } from "react";

export default function HomePage() {
  const { trackViewContent } = useMetaPixel();
  const [hasTrackedPricingView, setHasTrackedPricingView] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoadingDownloadUrl, setIsLoadingDownloadUrl] = useState(true);
  const [demoKey] = useState(0);

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

  useEffect(() => {
    const fetchDownloadUrl = async () => {
      try {
        const response = await fetch("/api/download-url");
        if (response.ok) {
          const data = await response.json();
          setDownloadUrl(data.downloadUrl || null);
        }
      } catch (error) {
        console.error("Failed to fetch download URL:", error);
      } finally {
        setIsLoadingDownloadUrl(false);
      }
    };

    fetchDownloadUrl();
  }, []);

  useEffect(() => {
    const trackPricingView = () => {
      const pricingSection = document.getElementById("prices");
      if (pricingSection && !hasTrackedPricingView) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !hasTrackedPricingView) {
                const eventId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                trackViewContent(
                  {
                    content_name: "Pricing Section - Homepage",
                    content_category: "subscription",
                  },
                  eventId
                );
                setHasTrackedPricingView(true);
                observer.disconnect();
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(pricingSection);
        return () => observer.disconnect();
      }
    };

    const timeout = setTimeout(trackPricingView, 500);
    return () => clearTimeout(timeout);
  }, [trackViewContent, hasTrackedPricingView]);

  useEffect(() => {
    let isInitialLoad = true;

    const handleHashScroll = (isInitial = false) => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.substring(1);

        const attemptScroll = (attempts = 0) => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (attempts < 20) {
            setTimeout(() => attemptScroll(attempts + 1), 200);
          }
        };

        if (isInitial) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            attemptScroll();
          }, 400);
        } else {
          attemptScroll();
        }
      }
    };

    handleHashScroll(true);
    isInitialLoad = false;

    const handleHashChange = () => {
      handleHashScroll(false);
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleDownloadClick = async () => {
    if (isLoadingDownloadUrl) {
      window.open("/dashboard", "_blank");
      return;
    }

    if (downloadUrl) {
      await handleDownload();
    } else {
      window.open("/dashboard", "_blank");
    }
  };

  return (
    <>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="software" />
      <StructuredData type="product" />
      <StructuredData type="faq" />
      <LandingHeader />
      <main data-page="home" className="pt-30">
        <div className="max-w-7xl mx-auto px-3 pb-0">
          <h1 className="md:text-4xl  text-3xl font-semibold text-gray-900 tracking-tight">
            <span className=" text-transparent bg-clip-text bg-gradient-to-r to-gray-400 from-black">
              Your private copy-trading infrastructure.
            </span>
          </h1>
          <p className="mt-3 text-gray-600 text-xl max-w-xl">
            Runs entirely on your machine. Your server, your IP, your rules.
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-3 pb-0">
          <Button
            type="button"
            onClick={handleDownloadClick}
            className="mt-4 inline-flex items-center gap-3 rounded-full bg-black px-3 py-4 text-md text-white transition-all duration-200 hover:bg-gray-600"
          >
            <span>Get Started For Free</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <section className="max-w-7xl mx-auto px-3 pt-8 user-select-none  ">
          <div className="grid gap-8 items-center bg-gray-100 p-20 rounded-lg relative overflow-hidden border border-gray-200 pb-20">
            <TradingViewBackground />
            <div className=" bg-white w-[900px]  h-[600px] rounded-lg relative transition-transform duration-0 overflow-hidden border border-gray-200 z-10 shadow-2xl shadow-black">
              <IpTradeWindowDemo key={demoKey} initialViewState="accounts" initialExpandedGroups={{ "master-2": false }} />
            </div>
          </div>
        </section>

        <SupportedPlatformsRow className="px-3 pt-3" />

        <div className="py-24">

          <h2 className="text-3xl text-center text-gray-900 mb-1 ">
            Built for the platforms traders already use
          </h2>
          <p className="text-md text-center text-gray-600  max-w-2xl mx-auto px-6 ">
            MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS—all
            running locally on your computer
          </p>
        </div>

        <FeaturesSection />


        <ProductsSection demoSide="left" />

        <Mt5DirectSection demoSide="right" />

        <div className="pt-24" />
        <CalendarStatsSection />

        <div className="pt-24">
          <StepsSection />
        </div>

        <Suspense fallback={<div className="py-24 text-center text-gray-600">Loading pricing...</div>}>
          <PricingSection variant="landing" />
        </Suspense>

        <ComparisonTable />

        <AIQuestionSection />

        <div className="max-w-7xl mx-auto px-3 grid grid-cols-1 md:grid-cols-6 md:gap-3">
          <div className="md:col-span-4 pb-6">
            <p className="text-xl text-gray-600 mb-1">Common questions</p>
            <p className="md:text-3xl text-2xl mb-3 text-gray-900">
              Frequently Asked Questions
            </p>
            <FAQSection />
          </div>
          <div className="md:col-span-2 mb-3">
            <FounderCard />
          </div>
        </div>

        <CallToActionSection onDownloadClick={handleDownloadClick} />
      </main>
      <Footer />
    </>
  );
}
