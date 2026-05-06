"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Check, X } from "lucide-react";

type CellValue = "yes" | "no" | "varies" | string;

const COMPETITORS = [
  {
    id: "tradersConnect",
    name: "Traders Connect",
    href: "https://tradersconnect.com/",
    logoSrc: "/assets/tradersconnect.svg",
    logoWidth: 140,
    logoHeight: 32,
  },
  {
    id: "duplikium",
    name: "Duplikium",
    href: "https://www.trade-copier.com/",
    logoSrc: "/assets/duplikium.png",
    logoWidth: 120,
    logoHeight: 32,
  },
  {
    id: "metaCopier",
    name: "MetaCopier",
    href: "https://metacopier.io/",
    logoSrc: "/assets/metacopier.svg",
    logoWidth: 112,
    logoHeight: 28,
  },
  {
    id: "socialTraderTools",
    name: "Social Trader Tools",
    href: "https://www.socialtradertools.com/",
    logoSrc: "/assets/social-trader-tools.png",
    logoWidth: 130,
    logoHeight: 32,
  },
] as const;

type CompetitorId = (typeof COMPETITORS)[number]["id"];

interface ComparisonRow {
  feature: string;
  iptrade: CellValue;
  competitors: Record<CompetitorId, CellValue>;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Pricing model",
    iptrade: "Flat rate",
    competitors: {
      tradersConnect: "$10/acct (Std)",
      duplikium: "€9/acct (1–10)",
      metaCopier: "~$8.10/acct/mo",
      socialTraderTools: "Tiered hosting",
    },
  },
  {
    feature: "Cost · 5 accounts",
    iptrade: "$19/mo",
    competitors: {
      tradersConnect: "$50/mo",
      duplikium: "€45/mo",
      metaCopier: "$40.50/mo",
      socialTraderTools: "$60/mo",
    },
  },
  {
    feature: "Cost · 8 accounts",
    iptrade: "$19/mo",
    competitors: {
      tradersConnect: "$80/mo",
      duplikium: "€72/mo",
      metaCopier: "$64.80/mo",
      socialTraderTools: "$120/mo",
    },
  },
  {
    feature: "Cost · 10 accounts",
    iptrade: "$50/mo",
    competitors: {
      tradersConnect: "$100/mo",
      duplikium: "€90/mo",
      metaCopier: "$81/mo",
      socialTraderTools: "$120/mo",
    },
  },
  {
    feature: "Cost · 15 accounts",
    iptrade: "$50/mo",
    competitors: {
      tradersConnect: "$150/mo",
      duplikium: "€127.50/mo",
      metaCopier: "$121.50/mo",
      socialTraderTools: "$220/mo",
    },
  },
  {
    feature: "Single IP address",
    iptrade: "yes",
    competitors: {
      tradersConnect: "no",
      duplikium: "no",
      metaCopier: "no",
      socialTraderTools: "no",
    },
  },
  {
    feature: "Runs locally",
    iptrade: "yes",
    competitors: {
      tradersConnect: "no",
      duplikium: "no",
      metaCopier: "no",
      socialTraderTools: "no",
    },
  },
  {
    feature: "Zero data sent externally",
    iptrade: "yes",
    competitors: {
      tradersConnect: "no",
      duplikium: "no",
      metaCopier: "no",
      socialTraderTools: "no",
    },
  },
  {
    feature: "Trade calendar (PnL heatmap)",
    iptrade: "yes",
    competitors: {
      tradersConnect: "no",
      duplikium: "no",
      metaCopier: "no",
      socialTraderTools: "no",
    },
  },
  {
    feature: "Analytics & history (no cloud)",
    iptrade: "yes",
    competitors: {
      tradersConnect: "no",
      duplikium: "no",
      metaCopier: "no",
      socialTraderTools: "no",
    },
  },
  {
    feature: "MT4, MT5 & cTrader",
    iptrade: "yes",
    competitors: {
      tradersConnect: "yes",
      duplikium: "yes",
      metaCopier: "yes",
      socialTraderTools: "no",
    },
  },
  {
    feature: "macOS support",
    iptrade: "yes",
    competitors: {
      tradersConnect: "varies",
      duplikium: "varies",
      metaCopier: "varies",
      socialTraderTools: "no",
    },
  },
  {
    feature: "Prop firm compatible",
    iptrade: "yes",
    competitors: {
      tradersConnect: "yes",
      duplikium: "yes",
      metaCopier: "varies",
      socialTraderTools: "varies",
    },
  },
  {
    feature: "No VPS needed",
    iptrade: "yes",
    competitors: {
      tradersConnect: "yes",
      duplikium: "yes",
      metaCopier: "varies",
      socialTraderTools: "yes",
    },
  },
];

function IptradeCellValue({ value }: { value: string }) {
  if (value === "yes") {
    return <Check className="h-4 w-4 text-white mx-auto" strokeWidth={2.5} />;
  }
  if (value === "no") {
    return <X className="h-4 w-4 text-red-600 mx-auto" strokeWidth={2.5} />;
  }
  if (value === "varies") {
    return <span className="text-sm text-white font-semibold">Varies</span>;
  }
  if (value === "Flat rate") {
    return (
      <span className="text-xs font-medium text-white bg-white/15 border border-white/30 rounded-full px-2.5 py-0.5">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-white font-semibold">{value}</span>;
}

function CompetitorCellValue({ value }: { value: string }) {
  if (value === "yes") {
    return <Check className="h-4 w-4 text-green-600 mx-auto" />;
  }
  if (value === "no") {
    return <X className="h-4 w-4 text-red-600 mx-auto" />;
  }
  if (value === "varies" || value === "Varies") {
    return (
      <span className="text-xs text-gray-600 leading-snug">Varies</span>
    );
  }
  if (value === "Per account") {
    return (
      <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5">
        {value}
      </span>
    );
  }
  if (value.startsWith("~")) {
    return (
      <span className="text-xs text-gray-600 leading-snug tabular-nums">
        {value}
      </span>
    );
  }
  if (/^[$€]\d/.test(value.trim())) {
    return (
      <span className="text-xs text-gray-600 leading-snug tabular-nums">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-gray-500">{value}</span>;
}

const GRID_COLS =
  "grid-cols-[minmax(11rem,1.35fr)_minmax(max-content,1fr)_repeat(4,minmax(max-content,1fr))]";

function rowLeaveHandler(
  i: number,
  setHoveredRow: (row: number | null) => void,
) {
  return (e: React.MouseEvent) => {
    const to = e.relatedTarget;
    const el =
      to instanceof Element ? to.closest("[data-comparison-row]") : null;
    if (el?.getAttribute("data-comparison-row") === String(i)) return;
    setHoveredRow(null);
  };
}

export function ComparisonTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section className="pt-14 max-w-7xl mx-auto px-3">
      <div className="mb-10 text-left">
        <p className="text-xl text-gray-600 mb-1">How we compare</p>
        <h2 className="flex flex-col items-start gap-1 text-3xl text-gray-900 md:flex-row md:flex-wrap md:gap-x-2 md:gap-y-0 md:text-5xl">
          <span>IPTRADE vs.</span>
          <span>leading trade copiers</span>
        </h2>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <div className={`grid w-full gap-0 ${GRID_COLS}`}>
          <div className="min-w-0 px-4 py-4 text-sm font-medium text-gray-500 border-b border-gray-200 bg-gray-50 flex items-center justify-center text-center">
            Feature
          </div>
          <div className="px-3 py-4 flex items-center justify-center text-center bg-green-800 border-x border-b border-green-900">
            <span className="font-bold text-lg text-white mx-1">IPTRADE</span>
          </div>
          {COMPETITORS.map((c, idx) => (
            <div
              key={c.id}
              className={`px-2 py-3 flex items-center justify-center border-b border-gray-200 bg-gray-50 ${
                idx < COMPETITORS.length - 1 ? "border-r border-gray-200" : ""
              }`}
            >
              <Link
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 mx-2 items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src={c.logoSrc}
                  alt={c.name}
                  width={c.logoWidth}
                  height={c.logoHeight}
                  className="h-7 w-auto max-w-30 shrink-0 object-contain object-center"
                />
              </Link>
            </div>
          ))}

          {comparisonData.map((row, i) => {
            const isLastRow = i === comparisonData.length - 1;
            const bottomRule = isLastRow ? "" : "border-b border-gray-200";
            const isWhiteStripe = i % 2 === 0;
            const isHovered = hoveredRow === i;
            const featureBg = isWhiteStripe
              ? isHovered
                ? "bg-gray-50/50"
                : "bg-white"
              : isHovered
                ? "bg-white"
                : "bg-gray-50/50";
            const competitorBg = featureBg;
            const iptradeBgBorder =
              "bg-green-800 border-x border-green-900";
            const bottomRuleGreen = isLastRow
              ? ""
              : isWhiteStripe
                ? "border-b border-green-900"
                : "border-b border-green-900";
            const rowProps = {
              "data-comparison-row": i,
              onMouseEnter: () => setHoveredRow(i),
              onMouseLeave: rowLeaveHandler(i, setHoveredRow),
            } as const;

            return (
              <Fragment key={row.feature}>
                <div
                  {...rowProps}
                  className={`min-w-0 px-4 py-3.5 text-sm font-medium text-gray-700 transition-colors duration-150 ${bottomRule} ${featureBg} flex items-center justify-center text-center`}
                >
                  {row.feature}
                </div>
                <div
                  {...rowProps}
                  className={`min-w-0 flex items-center justify-center px-3 py-3.5 text-center transition-colors duration-150 ${iptradeBgBorder} ${bottomRuleGreen}`}
                >
                  <IptradeCellValue value={row.iptrade} />
                </div>
                {COMPETITORS.map((c, idx) => (
                  <div
                    key={c.id}
                    {...rowProps}
                    className={`min-w-0 px-2 py-3.5 flex items-center justify-center text-center transition-colors duration-150 ${bottomRule} ${competitorBg} ${
                      idx < COMPETITORS.length - 1 ? "border-r border-gray-200" : ""
                    }`}
                  >
                    <CompetitorCellValue value={row.competitors[c.id]} />
                  </div>
                ))}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
