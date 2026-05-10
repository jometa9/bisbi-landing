import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/app-url";
import { getUser } from "@/lib/db/queries";
import type { Metadata, Viewport } from "next";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Bisbi — Apretá. Hablá. Pegá.",
    description:
      "Dictado por voz que pega donde esté tu cursor. Soporta 5 idiomas. 100% local, privado, Mac.",
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
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
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
