import { getAppUrl } from "@/lib/app-url";

export const seoConfig = {
  siteName: "IPTRADE",
  siteUrl: getAppUrl(),
  defaultTitle: "IPTRADE",
  defaultDescription:
    "Local trade copier — MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. IPTRADE Multi runs on your machine—zero data exposure, single IP, designed for prop firms. Free and Unlimited plans.",

  primaryKeywords: [
    "trade copying software",
    "MetaTrader trade copier",
    "MetaTrader 4 trade copying",
    "MetaTrader 5 trade copying",
    "cTrader trade copying",
    "trading automation",
    "copy trading software",
    "forex trade copier",
    "trading platform integration",
    "secure trade copying",
    "local trade copying",
    "single IP trade copier prop firms",
    "designed for prop firms",
    "prop firm trade copier",
    "ip restrictions",
    "prop firm ip restrictions",
    "prop firm account ban",
    "prop firm trading",
    "prop firm trading software",
    "single ip trade copier",
    "local trade copier",
    "IPTRADE Multi",
  ],

  longTailKeywords: [
    "best trade copying software for MetaTrader",
    "secure trade copying between MetaTrader 4 and MetaTrader 5",
    "local trade copying software",
    "professional trade copying tools",
    "MetaTrader 4 automation software",
    "MetaTrader 5 automation software",
    "prop firm trading platform",
    "prop firm trading platform software",
    "prop firm trading platform software for MetaTrader",
    "prop firm trading platform software for MetaTrader 4",
    "prop firm trading platform software for MetaTrader 5",
    "prop firm trading platform software for cTrader",
    "cTrader automation software",
    "copy trades between trading platforms",
    "secure forex trade copying",
    "trading software for professionals",
  ],

  social: {
    linkedin: "company/iptrade",
    instagram: "@iptradecopier",
  },

  creator: {
    name: "Joaquin Metayer",
    linkedin: "https://www.linkedin.com/in/joaquinmetayer/",
  },

  founder: {
    name: "Joaquin Metayer",
    linkedin: "https://www.linkedin.com/in/joaquinmetayer/",
  },

  contact: {
    email: "support@iptradecopier.com",
    address:
      "IPTRADE COPIER LLC, 131 Continental Dr, Suite 305, Newark, Delaware 19713, US",
  },

  pages: {
    home: {
      title: "IPTRADE",
      description:
        "Local trade copier — MT4, MT5 & cTrader on Windows; MT5 & cTrader on macOS. IPTRADE Multi: your machine, your IP, zero data exposure, designed for prop firms. Free and Unlimited plans.",
      keywords: [
        "local trade copier",
        "trade copying software",
        "MetaTrader 4 trade copying",
        "MetaTrader 5 trade copying",
        "cTrader trade copying",
        "MT4 MT5 cTrader copier",
        "IPTRADE Multi",
        "single IP trade copier",
        "prop firm trade copier",
        "zero data exposure",
      ],
    },
    faqs: {
      title: "IPTRADE",
      description:
        "Complete documentation and frequently asked questions about IPTRADE. Learn how to set up MetaTrader, cTrader, configure trading accounts, and use our trade copying software effectively.",
      keywords: [
        "IPTRADE documentation",
        "trade copying setup guide",
        "MetaTrader setup tutorial",
        "trading software documentation",
        "IPTRADE FAQs",
        "trading software help",
      ],
    },
    legal: {
      title: "IPTRADE",
      description:
        "Legal information for IPTRADE including terms of service and privacy policy for our trade copying software.",
      keywords: [
        "IPTRADE legal",
        "terms of service",
        "privacy policy",
        "trading software legal",
      ],
    },
  },
};

export function generatePageMetadata(page: keyof typeof seoConfig.pages) {
  const pageConfig = seoConfig.pages[page];

  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    openGraph: {
      title: pageConfig.title,
      description: pageConfig.description,
      type: "website",
      url: `${seoConfig.siteUrl}/${page === "home" ? "" : page}`,
      siteName: seoConfig.siteName,
    },
  };
}
