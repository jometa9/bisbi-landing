import "@/app/globals.css";
import { MetaPixel } from "@/components/meta-pixel";
import { MetaPixelScript } from "@/components/meta-pixel-script";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/app-url";
import { getUser } from "@/lib/db/queries";
import type { Metadata, Viewport } from "next";
import React from "react";

const metadataBaseUrl = getAppUrl();

export const metadata: Metadata = {
  applicationName: "IPTRADE",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  title: "IPTRADE",
  description:
    "IPTRADE Multi: local trade copier for MetaTrader 4, MetaTrader 5, and cTrader. Runs on your Windows or Mac—single IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans. Download now.",
  keywords: [
    "trade copying software",
    "MetaTrader trade copier",
    "MetaTrader 4 trade copying",
    "MetaTrader 5 trade copying",
    "cTrader trade copying",
    "local trade copier",
    "copy trading software",
    "forex trade copier",
    "single IP trade copier prop firms",
    "single IP trade copier",
    "IPTRADE Multi",
    "MT4 MT5 cTrader copier",
    "trade copier Windows macOS",
    "trade copier for prop firms",
    "trade copier for retail traders",
    "secure trade copying",
    "trading automation",
    "copy trading app",
  ],
  authors: [
    {
      name: "Joaquin Metayer",
      url: "https://www.linkedin.com/in/joaquinmetayer/",
    },
  ],
  creator: "IPTRADE COPIER LLC",
  publisher: "IPTRADE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(metadataBaseUrl),
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "IPTRADE",
    url: "/",
    title: "IPTRADE",
    description:
      "IPTRADE Multi: local trade copier for MT4, MT5, and cTrader. Runs on your Windows or Mac—single IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans.",
    images: [
      {
        url: "/assets/preview-home.png",
        width: 1200,
        height: 630,
        alt: "IPTRADE – Local trade copier for MT4, MT5, and cTrader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IPTRADE",
    description:
      "IPTRADE Multi runs on your machine—single IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans. MT4, MT5, cTrader.",
    images: ["/assets/preview-home.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ZCyBo0lHmxMxB9jOF5Smj8BktHGIx9BhJCc6-9apTfU",
    other: {
      "facebook-domain-verification": "w6xj86paqsqyg1i9af38w8eruajx10",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPromise = getUser();

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "849744324157395";

  return (
    <html lang="en" className="text-neutral-900">
      <body
        className="min-h-screen font-sans text-neutral-900 antialiased"
        suppressHydrationWarning={true}
      >
        <>
          <MetaPixelScript pixelId={pixelId} />
          <MetaPixel pixelId={pixelId} />
          <Providers userPromise={userPromise}>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1 w-full bg-white">{children}</main>
            </div>
          </Providers>
        </>
      </body>
    </html>
  );
}
