import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Try IPTRADE in your browser. Interactive demo of the local trade copier for MT4, MT5, and cTrader. No install required.",
  keywords: [
    "IPTRADE demo",
    "trade copier demo",
    "IPTRADE try",
    "MT4 MT5 cTrader demo",
  ],
  alternates: { canonical: "/demo" },
  openGraph: {
    description:
      "Try IPTRADE in your browser. See how the local trade copier works for MT4, MT5, and cTrader.",
    url: "/demo",
    type: "website",
    images: [
      { url: "/assets/preview-home.png", width: 1200, height: 630, alt: "IPTRADE Demo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: "Try IPTRADE in your browser. Interactive demo of the local trade copier.",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumb: {
            items: [
              { name: "Home", url: "/" },
              { name: "Demo", url: "/demo" },
            ],
          },
        }}
      />
      <StructuredData
        type="webpage"
        data={{
          webpage: {
            name: "IPTRADE - Demo",
            description:
              "Try IPTRADE in your browser. Interactive demo of the local trade copier for MT4, MT5, and cTrader.",
            url: "/demo",
          },
        }}
      />
      <h1 className="sr-only">
        IPTRADE Demo – Try the local trade copier for MT4, MT5, and cTrader in your browser
      </h1>
      {children}
    </>
  );
}
