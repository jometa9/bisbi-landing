import { LandingHeader } from "@/components/landing/landing-header";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  description:
    "Complete documentation and setup guides for IPTRADE copytrading software. MT4, MT5, cTrader setup, IPTRADE Multi, link accounts, and troubleshooting.",
  keywords: [
    "IPTRADE documentation",
    "trade copier setup",
    "MT4 MT5 cTrader setup",
    "IPTRADE Multi guide",
    "copy trading setup",
    "trade copier troubleshooting",
  ],
  alternates: { canonical: "/documentation" },
  openGraph: {
    description:
      "Complete documentation and setup guides for IPTRADE copytrading software. MT4, MT5, cTrader setup and troubleshooting.",
    url: "/documentation",
    type: "website",
    images: [
      { url: "/assets/preview-home.png", width: 1200, height: 630, alt: "IPTRADE Documentation" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Complete documentation and setup guides for IPTRADE copytrading software.",
  },
};

export default function DocumentationPage() {
  let markdownContent = "";

  try {
    const filePath = join(process.cwd(), "public", "docs.md");
    markdownContent = readFileSync(filePath, "utf-8");
  } catch {
    markdownContent =
      "# Documentation\n\nThe `docs.md` file was not found.";
  }

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumb: {
            items: [
              { name: "Home", url: "/" },
              { name: "Documentation", url: "/documentation" },
            ],
          },
        }}
      />
      <StructuredData
        type="webpage"
        data={{
          webpage: {
            name: "IPTRADE - Documentation",
            description:
              "Complete documentation and setup guides for IPTRADE copytrading software. MT4, MT5, cTrader setup, IPTRADE Multi, and troubleshooting.",
            url: "/documentation",
          },
        }}
      />
      <LandingHeader />
      <main className="pt-25 pb-20">
        <div className="px-3 w-full max-w-7xl mx-auto">
          <div className="w-full space-y-4 pb-8">
            <div className="max-w-7xl mx-auto pb-0">
              <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                Documentation
              </h1>
              <p className="mt-3 text-gray-600 text-2xl max-w-2xl">
                Complete guides and documentation for IPTRADE software - everything you
                need to get started and make the most of your trading experience.
              </p>
              <p className="mt-2 text-gray-600 text-sm">
                Updated to latest version on {lastUpdated}
              </p>
            </div>
            <hr className="border-gray-200 my-8 max-w-4xl" />

            <div className="max-w-4xl">
              <MarkdownRenderer content={markdownContent} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

