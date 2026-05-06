import { LandingHeader } from "@/components/landing/landing-header";
import { MailtoLink } from "@/components/mailto-link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  description:
    "Legal documentation for IPTRADE: Privacy Policy, Terms of Use, Cookie Policy, Billing, Complaints, Refund Policy and Disclaimer. Read our policies.",
  keywords: [
    "IPTRADE legal",
    "IPTRADE privacy policy",
    "IPTRADE terms of use",
    "trade copier terms",
    "IPTRADE refund policy",
  ],
  alternates: { canonical: "/legal" },
  openGraph: {
    description:
      "Privacy Policy, Terms of Use, Cookie Policy, Billing, Complaints, Refunds and Disclaimer for IPTRADE.",
    url: "/legal",
    type: "website",
    images: [
      { url: "/assets/preview-home.png", width: 1200, height: 630, alt: "IPTRADE Legal" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: "Privacy Policy, Terms of Use, Cookie Policy and more for IPTRADE.",
  },
};

export default function LegalPage() {
  const documents = [
    { id: "cookies", title: "Cookies Policy", filename: "cookies.md" },
    { id: "privacy", title: "Privacy Policy", filename: "privacy.md" },
    { id: "terms", title: "Terms of Use", filename: "terms.md" },
    { id: "billing", title: "Billing Policy", filename: "billing.md" },
    { id: "complaints", title: "Complaints Policy", filename: "complaints.md" },
    { id: "refunds", title: "Refund Policy", filename: "refunds.md" },
    { id: "disclaimer", title: "Disclaimer", filename: "disclaimer.md" },
  ];

  const contents: Record<string, string> = {};

  for (const doc of documents) {
    try {
      const filePath = join(process.cwd(), "public", doc.filename);
      contents[doc.id] = readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading ${doc.filename}:`, error);
      contents[doc.id] = `# ${doc.title}\n\nThe \`${doc.filename}\` file was not found.`;
    }
  }

  const legalDocsUpdated = "February 2026";

  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumb: {
            items: [
              { name: "Home", url: "/" },
              { name: "Legal", url: "/legal" },
            ],
          },
        }}
      />
      <StructuredData
        type="webpage"
        data={{
          webpage: {
            name: "IPTRADE - Legal",
            description:
              "Legal documentation for IPTRADE: Privacy Policy, Terms of Use, Cookie Policy, Billing, Complaints, Refund Policy and Disclaimer.",
            url: "/legal",
          },
        }}
      />
      <LandingHeader />
      <main className="pt-25 pb-20">
        <div className="px-3 w-full max-w-7xl mx-auto">
          <div className="w-full space-y-4 pb-8">
            <div className="max-w-4xl pb-0">
              <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                Legal Information
              </h1>
              <p className="mt-3 text-gray-600 text-2xl max-w-2xl">
                Our terms and conditions, privacy policy, and other legal documentation - 
                everything you need to know about using IPTRADE software.
              </p>
              <p className="mt-2 text-gray-600 text-sm">
                Documents last updated: {legalDocsUpdated}
              </p>
            </div>

            <div className="max-w-4xl my-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <ul className="space-y-2 pl-3">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`#${doc.id}`}
                      className="text-gray-400 hover:text-gray-600 hover:underline"
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="border-gray-200 my-8 max-w-4xl" />

            {documents.map((doc, index) => (
              <div key={doc.id}>
                {index > 0 && <hr className="border-gray-200 my-8 max-w-4xl" />}
                <div id={doc.id} className="scroll-mt-20 max-w-4xl">
                  <MarkdownRenderer content={contents[doc.id] || ""} />
                </div>
              </div>
            ))}

            <hr className="border-gray-200 my-8 max-w-4xl" />
            <div className="max-w-4xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                Questions about our legal policies?
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <MailtoLink label="support@iptradecopier.com" copiedLabel="Copied to clipboard" /></p>
                <p><strong>Address:</strong> 131 Continental Dr, Suite 305, Newark, DE 19713, United States</p>
                <p><strong>Website:</strong> https://iptradecopier.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
