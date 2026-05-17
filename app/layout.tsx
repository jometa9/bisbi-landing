import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/app-url";
import { assetPath } from "@/lib/asset-path";
import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import React from "react";

const metadataBaseUrl = getAppUrl();

export const metadata: Metadata = {
  applicationName: "Bisbi",
  title: "Bisbi — Apretá. Hablá. Pegá.",
  description:
    "Bisbi es una app de dictado por voz local para Mac. Apretá un atajo, hablá, y tus palabras aparecen donde esté el cursor — en cualquier app, en cualquier idioma.",
  keywords: [
    "dictado por voz",
    "voz a texto",
    "transcripción por voz",
    "escribir con la voz",
    "dictado multilingüe",
    "dictado por voz mac",
    "bisbi",
    "dictado local",
    "transcripción con ia",
    "entrada de voz",
    "escritura bilingüe",
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
    locale: "es_LA",
    siteName: "Bisbi",
    url: "/",
    title: "Bisbi — Apretá. Hablá. Pegá.",
    description:
      "Dictado por voz local para Mac. Apretá un atajo, hablá, y Bisbi pega tus palabras donde esté el cursor — en cualquier idioma.",
    images: [
      {
        url: "/assets/giphy.gif",
        width: 320,
        height: 220,
        alt: "Bisbi — dictado por voz en acción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bisbi — Apretá. Hablá. Pegá.",
    description:
      "Dictado por voz que pega donde esté tu cursor. Soporta 5 idiomas. 100% local, privado, Mac.",
    images: ["/assets/giphy.gif"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body
        className="min-h-screen font-sans antialiased"
        style={
          {
            backgroundColor: "#FFFFFF",
            color: "#1A1A18",
            "--asset-owl-head": `url(${assetPath("/owl_head.svg")})`,
            "--asset-owl-head-rec": `url(${assetPath("/owl_head_rec.svg")})`,
            "--asset-apple-icon": `url(${assetPath("/apple-173-svgrepo-com.svg")})`,
          } as CSSProperties
        }
        suppressHydrationWarning={true}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 w-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
