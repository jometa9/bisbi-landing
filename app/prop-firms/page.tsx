import { LandingHeader } from "@/components/landing/landing-header";
import { IpTradeWindowDemo } from "@/components/landing/iptrade-window-demo";
import { LandingPageTracker } from "@/components/landing/cta-button";
import TradingViewHeadmap from "@/components/landing/trading-view-headmap";
import { PropFirmLogosScroll } from "@/components/landing/prop-firm-logos-scroll";
import { SupportedPlatformsRow } from "@/components/landing/supported-platforms-row";
import { PropFirmConnectionTerminal } from "@/components/landing/prop-firm-connection-terminal";
import { PropFirmFAQSection } from "@/components/landing/prop-firm-faq-section";
import { AIAssistantCard } from "@/components/landing/ai-assistant-card";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Shield, Lock, CheckCircle, Zap, Target, Layers, Globe, Frown, BadgeCheck, Server, CalendarDays } from "lucide-react";
import { ProductsSection } from "@/components/landing/products-section";
import { Mt5DirectSection } from "@/components/landing/mt5-direct-section";
import { CalendarStatsSection } from "@/components/landing/calendar-stats-section";
import { StepsSection } from "@/components/steps-section";
import Link from "next/link";
import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export const metadata: Metadata = {
  description:
    "Local trade copier—MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS—single IP, designed for prop firm use. IPTRADE Multi runs on your machine: single IP, zero data exposure, complete privacy. Pass multiple challenges from one location. Verify your prop firm’s terms; see our Terms of Use.",
  keywords: [
    "prop firm trade copier",
    "FTMO trade copier",
    "single IP trade copier prop firms",
    "single IP trade copier",
    "local trade copier prop firms",
    "MT4 MT5 cTrader prop firm Windows",
    "trade copier single IP",
    "prop firm challenge copier",
    "funded account copier",
    "IP restrictions trade copier",
  ],
  alternates: { canonical: "/prop-firms" },
    openGraph: {
    description:
      "Local trade copier—MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. Single IP, zero data exposure, complete privacy. Built for single-IP prop firm use—verify each firm’s terms.",
    url: "/prop-firms",
    type: "website",
    images: [
      {
        url: "/assets/preview-prop-firm.png",
        width: 1200,
        height: 630,
        alt: "IPTRADE - Prop firm trade copier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Local trade copier—MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. Single IP, zero data exposure. Built for single-IP prop firm use.",
  },
};

export default function PropFirmsLandingPage() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumb: {
            items: [
              { name: "Home", url: "/" },
              { name: "Prop Firms", url: "/prop-firms" },
            ],
          },
        }}
      />
      <StructuredData
        type="webpage"
        data={{
          webpage: {
            name: "IPTRADE - Prop Firms",
            description:
              "Local trade copier—MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS—single IP, designed for prop firm use. Zero data exposure, complete privacy. Verify each prop firm’s terms.",
            url: "/prop-firms",
          },
        }}
      />
      <LandingPageTracker pageName="prop_firms_landing" product="prop_firm_solution" />
      <LandingHeader />

      <section className="pt-30 pb-3 px-3">
        <div>

          <div className="grid gap-3 md:grid-cols-2 md:items-center">
            <div className="min-w-0">


              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-5 leading-tight">
              Run multiple
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
                prop firm challenges
                </span>
                without getting banned.
              </h1>

              <div className="my-4 flex flex-wrap items-center gap-5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Single IP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Complete Privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Designed for Prop Firms</span>
                </div>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                Trade copier built for single-IP use with prop firms. One IP for all accounts, local processing, zero data exposure. Always verify your prop firm’s terms—see our Terms of Use.
              </p>

              <div className="pb-3">
                <Button
                  asChild
                  className="mt-5 inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full bg-black px-4 py-4 text-md text-white transition-all duration-200 hover:bg-gray-600"
                >
                  <Link href="/dashboard" target="_blank">
                    <span>Get Started For Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden w-full overflow-hidden md:block">
              <PropFirmLogosScroll />
            </div>
          </div>
          <SupportedPlatformsRow className="hidden pt-3 md:flex" />

          <section className="max-w-7xl mx-auto user-select-none mt-6">
            <div className="grid gap-8 items-center bg-gray-100 p-10 rounded-lg relative overflow-hidden border border-gray-200 pb-20 ">
              <TradingViewHeadmap />
              <div className=" bg-white w-[900px] h-[600px] rounded-lg relative transition-transform duration-0 overflow-hidden border border-gray-200 z-10 shadow-2xl shadow-gray-800">
                <IpTradeWindowDemo initialViewState="accounts" initialExpandedGroups={{ "master-2": false }} />
              </div>
            </div>
          </section>
          <SupportedPlatformsRow className="pt-3 md:hidden" />


        </div>
      </section>

      <div className="mb-3 mx-3 rounded-lg  gap-3 pt-24">
        <p className="text-gray-600 text-xl mb-1">Avoid problems</p>
        <h2 className="text-3xl md:text-6xl text-gray-900 mb-6">Why multiple IPs get you banned</h2>
      </div>

      <div
          className="flex flex-col gap-12 rounded-lg bg-gray-100 p-6 mb-6 overflow-hidden mx-3"
        >
          <div className="grid grid-cols-1 xl:grid-cols-[50%_50%] gap-0 xl:gap-8 scroll-hidden">
            <div className="order-1 xl:order-1 xl:px-6 pb-6 xl:pb-0 scroll-hidden">
              <div className="mb-6 mt-6">
                <Frown
                  className="w-10 h-10"
                />
                <h3 className="text-4xl mt-6 ">Different IPs are a red flag for prop firms</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                Each account connects from different IP addresses. Prop firms instantly flag this as suspicious. You look like you're running accounts from different locations - major red flag.
              </p>
              <Link
                  href="/dashboard"
                  className=" inline-block rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 shadow-none hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Solve with IPTRADE
                </Link>
            </div>

            <div className="order-2 xl:order-2 pt-6 xl:pt-0 min-w-0 scroll-hidden">
              <div className="flex xl:ml-auto p-3-m-4">
                <div className="bg-gray-50 w-[600px] md:w-[900px]  rounded-lg relative transition-transform duration-0 overflow-hidden z-10 shadow-2xl shrink-0">
                  <PropFirmConnectionTerminal />
                </div>
              </div>
            </div>
          </div>
        </div>

      <section id="features" className="pt-24">
        <div className="px-3 max-w-7xl mx-auto">
          <p className="text-gray-600 text-xl mb-1 text-left md:text-right">Features</p>
          <h2 className="text-3xl text-gray-900 mb-6 text-left md:text-right">
            Single IP so prop firms see one location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto">
            <Link
              href="#mt5-direct"
              className="md:col-span-2 relative flex flex-col pt-18 pb-8 p-6 bg-[#03618d] hover:bg-[#024a6b] rounded-lg overflow-hidden transition-colors cursor-pointer"
            >
              <div className="relative z-10">
                <Server className="h-6 w-6 text-white mb-3" />
                <h3 className="text-2xl mb-2 text-white">MT5 Direct Connection</h3>
                <p className="text-gray-200 text-sm mb-4">
                  Connect MetaTrader 5 accounts without the terminal installed or open—no Expert Advisor required.
                  Enter your broker credentials and IPTRADE connects directly to the MT5 server. Ideal for prop firm accounts
                  where you want full control without keeping platforms running.
                </p>
                <div>
                  <div className="mt-4 inline-block rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 shadow-none transition-colors">
                    Learn more
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-purple-800 rounded-lg">
              <Globe className="h-6 w-6 text-gray-200 mb-3" />
              <h3 className="text-2xl text-white mb-2">Cross-Platform Support</h3>
              <p className="text-gray-200 text-sm">
                MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. Automatic symbol translation handles different brokers and platforms. Copy between any combination effortlessly.
              </p>
            </div>
            <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-100 rounded-lg">
              <Shield className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="text-2xl mb-2">Single IP Address</h3>
              <p className="text-gray-600 text-sm">
                All accounts connect from the same IP—your computer. Prop firms see normal single-location trading activity, exactly like manual trading from one location.
              </p>
            </div>
            <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-green-800 rounded-lg">
              <Target className="h-6 w-6 text-gray-200 mb-3" />
              <h3 className="text-2xl text-white mb-2">Scale Without Limits</h3>
              <p className="text-gray-200 text-sm">
                Once funded, copy your strategy across all accounts. Same IP for all accounts, unlimited scaling. You remain responsible for each prop firm’s full terms.
              </p>
            </div>

            <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-400 text-white rounded-lg">
              <Lock className="h-6 w-6 text-gray-200 mb-3" />
              <h3 className="text-2xl text-white mb-2">100% Local Processing</h3>
              <p className="text-gray-200 text-sm">
                Everything happens on your computer. No external servers, no cloud processing, no data leaving your machine. Complete control and zero external dependencies.
              </p>
            </div>

            <div className="flex items-start flex-col pt-18 pb-8 p-6 bg-gray-900 rounded-lg">
              <Layers className="h-6 w-6 text-gray-200 mb-3" />
              <h3 className="text-2xl text-white mb-2">Pass Multiple Challenges</h3>
              <p className="text-gray-200 text-sm">
                Run 5, 10, or 20 challenges simultaneously with your proven strategy. Copy winning trades to all challenges with individual lot sizing per account. Works with all firms.
              </p>
            </div>

            <Link
              href="#calendar-stats"
              className="md:col-span-2 flex flex-col pt-18 pb-8 p-6 rounded-lg bg-indigo-800 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <CalendarDays className="h-6 w-6 text-gray-200 mb-3" />
              <h3 className="text-2xl mb-2 text-white">
                Built-in Calendar & Performance Analytics
              </h3>
              <p className="text-gray-200 text-sm mb-4">
                Track every trading day in a colour-coded calendar, drill from year
                to day, and surface KPIs like net PnL, win rate, profit factor,
                drawdown, expectancy and Sharpe—plus an IPTRADE Score that grades
                your discipline. Everything runs locally on your machine.
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


      <ProductsSection variant="prop-firms" demoSide="right" />

      <CalendarStatsSection />

      <div className="pt-24" />
      <Mt5DirectSection demoSide="left" />

<div className="pt-24">

      <StepsSection />
</div>


      <section id="prices">
        <Suspense fallback={<div className="pb-18 text-center">Loading pricing...</div>}>
          <PricingSection variant="landing" defaultProduct="multi" />
        </Suspense>
      </section>

      <ComparisonTable />

      <section className="pt-24" >
        <div className="max-w-7xl mx-auto px-3 grid grid-cols-1 md:grid-cols-6 md:gap-3">
          <div className="md:col-span-4 pb-6">
            <PropFirmFAQSection />
          </div>
          <div className="md:col-span-2 mb-3">
            <AIAssistantCard />
          </div>
        </div>
      </section>

            <section className="max-w-5xl mx-auto px-3 flex flex-col items-center justify-center gap-3 text-balance pt-34 pb-18 ">
        <p className="text-gray-600 text-xl mb-1">
          Single IP, built for prop firm use
        </p>
        <h2 className="md:text-7xl text-4xl text-gray-900 text-center">
          Start passing challenges today.
        </h2>

        <Button
          asChild
          className="mt-6 inline-flex items-center gap-3 rounded-full bg-black p-3 text-white transition-all duration-200 hover:bg-gray-600 text-lg"
        >
          <Link href="/dashboard">
            Get started for free
          </Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
}

