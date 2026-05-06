import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/app-url";
import { getUser } from "@/lib/db/queries";
import type { Metadata, Viewport } from "next";
import React from "react";

const metadataBaseUrl = getAppUrl();

export const metadata: Metadata = {
  applicationName: "Bisbi",
  title: "Bisbi — Press. Speak. Paste.",
  description:
    "Bisbi is a local-first voice dictation app for Mac and Windows. Press a shortcut, speak, and your words appear wherever your cursor is — in any app, in any language.",
  keywords: [
    "voice dictation",
    "voice to text",
    "speech to text",
    "voice typing",
    "multilingual dictation",
    "voice dictation mac",
    "voice dictation windows",
    "bisbi",
    "local voice dictation",
    "ai transcription",
    "voice input",
    "bilingual typing",
  ],
  authors: [
    {
      name: "Joaquin Metayer",
      url: "https://www.linkedin.com/in/joaquinmetayer/",
    },
  ],
  creator: "Bisbi",
  publisher: "Bisbi",
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
    siteName: "Bisbi",
    url: "/",
    title: "Bisbi — Press. Speak. Paste.",
    description:
      "Local-first voice dictation for Mac and Windows. Press a shortcut, speak, and Bisbi pastes your words wherever your cursor is — in any language.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bisbi — Press. Speak. Paste.",
    description:
      "Voice dictation that pastes wherever your cursor is. Supports 5 languages. 100% local, private, Mac & Windows.",
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPromise = getUser();

  return (
    <html lang="en">
      <body
        className="min-h-screen font-sans antialiased"
        style={{ backgroundColor: "#FFFFFF", color: "#1A1A18" }}
        suppressHydrationWarning={true}
      >
        <Providers userPromise={userPromise}>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 w-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
