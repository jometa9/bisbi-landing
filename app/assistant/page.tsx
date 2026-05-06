import { AIAssistantScreen } from "@/components/ai-assistant-screen";
import { LandingHeader } from "@/components/landing/landing-header";
import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  description:
    "Chat with Ugo, the IPTRADE AI assistant. Get instant answers about setup, MT4, MT5, cTrader, prop firms, and trade copying.",
  keywords: [
    "IPTRADE assistant",
    "IPTRADE help",
    "trade copier support",
    "IPTRADE chatbot",
    "Ugo AI",
  ],
  alternates: { canonical: "/assistant" },
  openGraph: {
    description:
      "Get help from Ugo, our AI assistant. Ask anything about IPTRADE and get instant answers.",
    url: "/assistant",
    type: "website",
    images: [
      { url: "/assets/preview-home.png", width: 1200, height: 630, alt: "IPTRADE AI Assistant" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: "Chat with Ugo, the IPTRADE AI assistant. Instant help for setup and trade copying.",
  },
};

export default function PublicAssistantPage() {
  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumb: {
            items: [
              { name: "Home", url: "/" },
              { name: "AI Assistant", url: "/assistant" },
            ],
          },
        }}
      />
      <StructuredData
        type="webpage"
        data={{
          webpage: {
            name: "IPTRADE - AI Assistant",
            description:
              "Chat with Ugo, the IPTRADE AI assistant. Get instant answers about setup, MT4, MT5, cTrader, and trade copying.",
            url: "/assistant",
          },
        }}
      />
      <LandingHeader />
      <main className="pt-20 min-h-screen pb-0 md:pb-8 overflow-hidden">
        <div className="px-3 w-full chat-container-mobile">
          <AIAssistantScreen />
        </div>
      </main>
    </>
  );
}




