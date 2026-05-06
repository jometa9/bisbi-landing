import { getAppUrl } from "@/lib/app-url";
import Script from "next/script";

export type StructuredDataType =
  | "organization"
  | "software"
  | "product"
  | "faq"
  | "breadcrumb"
  | "webpage"
  | "website";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface WebPageData {
  name: string;
  description: string;
  url: string;
}

interface StructuredDataProps {
  type: StructuredDataType;
  data?: {
    breadcrumb?: { items: BreadcrumbItem[] };
    webpage?: WebPageData;
  };
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = getAppUrl();

  const toAbsolute = (path: string) =>
    path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const getStructuredData = (): object | null => {
    switch (type) {
      case "breadcrumb": {
        const items = data?.breadcrumb?.items ?? [];
        if (items.length === 0) return null;
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: toAbsolute(item.url),
          })),
        };
      }
      case "webpage": {
        const page = data?.webpage;
        if (!page) return null;
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.name,
          description: page.description,
          url: toAbsolute(page.url),
          isPartOf: {
            "@type": "WebSite",
            name: "IPTRADE",
            url: baseUrl,
          },
        };
      }
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "IPTRADE",
          url: baseUrl,
          description:
            "IPTRADE Multi: local trade copier for MT4, MT5, and cTrader. Windows: MT4, MT5, cTrader; macOS: MT5 and cTrader. Your machine, single IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans.",
          publisher: {
            "@type": "Organization",
            name: "IPTRADE",
            logo: `${baseUrl}/assets/iconShadow025.png`,
          },
          inLanguage: "en-US",
        };
      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IPTRADE",
          url: baseUrl,
          logo: `${baseUrl}/assets/iconShadow025.png`,
          description:
            "Local trade copier for MT4, MT5, and cTrader. IPTRADE Multi runs on Windows (MT4, MT5, cTrader) and macOS (MT5 direct, cTrader). Your machine, single IP, zero data exposure, designed for prop firm IP restrictions.",
          foundingDate: "2025",
          sameAs: [
            "https://www.instagram.com/iptradecopier",
            "https://www.linkedin.com/company/iptrade",
          ],
        };

      case "software":
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "IPTRADE Multi",
          applicationCategory: "FinanceApplication",
          operatingSystem: ["Windows", "macOS"],
          description:
            "Local trade copier for MT4, MT5, and cTrader. Windows: full platforms; macOS: MT5 and cTrader. Your machine, single IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans.",
          url: baseUrl,
          author: {
            "@type": "Organization",
            name: "IPTRADE",
          },
          offers: [
            {
              "@type": "Offer",
              name: "Free Plan",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description: "Free plan to get started with trade copying",
            },
            {
              "@type": "Offer",
              name: "Unlimited Plan",
              price: "50",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description:
                "Unlimited plan with unlimited trading accounts and full configuration",
            },
          ],
          screenshot: `${baseUrl}/assets/preview-home.png`,
        };

      case "product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "IPTRADE Multi",
          description:
            "Local trade copier for MT4, MT5, and cTrader. Windows: full platforms; macOS: MT5 and cTrader. Your machine, your IP, zero data exposure, designed for prop firm IP rules. Free and Unlimited plans.",
          brand: {
            "@type": "Brand",
            name: "IPTRADE",
          },
          category: "Trading Software",
          offers: [
            {
              "@type": "Offer",
              name: "Free Plan",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description: "Free plan to get started",
            },
            {
              "@type": "Offer",
              name: "Unlimited Plan",
              price: "50",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description:
                "Unlimited plan with unlimited trading accounts and full configuration",
            },
          ],
        };

      case "faq":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "System Requirements & Compatibility",
              acceptedAnswer: {
                "@type": "Answer",
                text: "IPTRADE Multi: Windows 10/11 64-bit or macOS Apple Silicon ARM64. 8GB RAM minimum, 2GB free disk space. Windows: MT4, MT5, cTrader; macOS: MT5 and cTrader. Stable internet required.",
              },
            },
            {
              "@type": "Question",
              name: "How to start using IPTRADE?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Follow the App Setup Guide at the top of the page",
              },
            },
            {
              "@type": "Question",
              name: "Is it secure to use with prop firm accounts?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "IPTRADE runs locally with a single IP for all accounts and zero data exposure—designed to help you meet typical IP restrictions. Other prop firm rules vary by firm; you must verify each firm's terms and do your own research. See our Terms of Use.",
              },
            },
            {
              "@type": "Question",
              name: "How to install the bot on my platform?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Click on the link platforms button to start the process. It will search and find your platform installed on your computer and install the bot or expert advisors automatically. Then add the bot to the chart and run the link accounts process with your bots on the charts to see your accounts in the pending inbox.",
              },
            },
            {
              "@type": "Question",
              name: "How to link my bots that are running?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Click again on the link platforms button. The process will search and find your bots running on your computer and they will automatically appear as pending in the inbox to continue.",
              },
            },
            {
              "@type": "Question",
              name: "How does lot multiplier work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Lot multiplier multiplies your lot size by a factor. Example: with a lot multiplier of 1.5 and master lot size of 0.1, the slave account will use 0.15.",
              },
            },
            {
              "@type": "Question",
              name: "How does fixed lot size work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Fixed lot size sets a fixed lot size for the slave account, ignoring the lot multiplier. Example: with fixed lot size of 1, the slave account will use 1 lot regardless of the multiplier.",
              },
            },
            {
              "@type": "Question",
              name: "How does reverse trading work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Reverse trading reverses the direction of your trades. When enabled, the slave account trades in the opposite direction of the master account for all trades and orders, including pending and open trades.",
              },
            },
            {
              "@type": "Question",
              name: "How does symbol translation work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Symbol translation maps symbols from the master account to the slave account format. Example: mapping US500 to ES copies all trades with the symbol ES on the slave account.",
              },
            },
          ],
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
