"use client";

import {
  ninjatraderEnabled,
  propFirmAltHiddenUnlessNinjatrader,
} from "@/lib/payments/feature-flag";

type PropFirmLogosScrollProps = {
  className?: string;
};

type PropFirmLogo = {
  src: string;
  alt: string;
  invert: boolean;
  blacken: boolean;
};

const ALL_PROP_FIRM_LOGOS: readonly PropFirmLogo[] = [
  { src: "/assets/props/5erslogo.svg", alt: "The 5%ers", invert: false, blacken: true },
  { src: "/assets/props/alphacapital.svg", alt: "Alpha Capital", invert: false, blacken: true },
  { src: "/assets/props/aquafunded.webp", alt: "Aqua Funded", invert: false, blacken: true },
  { src: "/assets/props/atfunded.webp", alt: "ATFunded", invert: false, blacken: true },
  { src: "/assets/props/axi.svg", alt: "Axi", invert: false, blacken: true },
  { src: "/assets/props/blueberryfunded.svg", alt: "Blueberry Funded", invert: false, blacken: true },
  { src: "/assets/props/blueguardian.avif", alt: "Blue Guardian", invert: false, blacken: true },
  { src: "/assets/props/breakout.png", alt: "Breakout", invert: false, blacken: true },
  { src: "/assets/props/brightfunded.svg", alt: "Bright Funded", invert: false, blacken: true },
  { src: "/assets/props/citytradersimperium.png", alt: "City Traders Imperium", invert: false, blacken: true },
  { src: "/assets/props/cryptofundtrader.svg", alt: "Crypto Fund Trader", invert: false, blacken: true },
  { src: "/assets/props/darwinex.svg", alt: "Darwinex", invert: false, blacken: true },
  { src: "/assets/props/e8markets.svg", alt: "E8 Markets", invert: false, blacken: true },
  { src: "/assets/props/finotivefunding.svg", alt: "Finotive Funding", invert: false, blacken: true },
  { src: "/assets/props/fintokei.svg", alt: "Fintokei", invert: false, blacken: true },
  { src: "/assets/props/fortraders.svg", alt: "For Traders", invert: false, blacken: true },
  { src: "/assets/props/ftmo.svg", alt: "FTMO", invert: false, blacken: true },
  { src: "/assets/props/ftp.webp", alt: "FTP", invert: false, blacken: true },
  { src: "/assets/props/fundedelite.svg", alt: "Funded Elite", invert: false, blacken: true },
  { src: "/assets/props/Fundednext.avif", alt: "FundedNext", invert: false, blacken: true },
  { src: "/assets/props/fundingpips.svg", alt: "FundingPips", invert: false, blacken: true },
  { src: "/assets/props/fundingtraders.svg", alt: "FundingTraders", invert: false, blacken: true },
  { src: "/assets/props/fxify-logo.svg", alt: "FXIFY", invert: false, blacken: true },
  { src: "/assets/props/goatfunded.avif", alt: "Goat Funded", invert: false, blacken: true },
  { src: "/assets/props/hantectrader.png", alt: "Hantec Trader", invert: false, blacken: true },
  { src: "/assets/props/instantfunding.svg", alt: "Instant Funding", invert: false, blacken: true },
  { src: "/assets/props/larkfunding.png", alt: "Lark Funding", invert: false, blacken: true },
  { src: "/assets/props/maven.svg", alt: "Maven", invert: false, blacken: true },
  { src: "/assets/props/mentfunding.png", alt: "Ment Funding", invert: false, blacken: true },
  { src: "/assets/props/nordicfunder.webp", alt: "Nordic Funder", invert: false, blacken: true },
  { src: "/assets/props/seacrestmarkets.svg", alt: "Seacrest Markets", invert: false, blacken: true },
  { src: "/assets/props/thetradingpit.svg", alt: "The Trading Pit", invert: false, blacken: true },
  { src: "/assets/props/thinkcapital.svg", alt: "ThinkCapital", invert: false, blacken: true },
  { src: "/assets/props/topone.svg", alt: "TopOne", invert: false, blacken: true },
  { src: "/assets/props/tradeify.svg", alt: "Tradeify", invert: false, blacken: true },
  { src: "/assets/props/topstep.svg", alt: "Topstep", invert: false, blacken: true },
  {
    src: "/assets/props/apexfutures.svg",
    alt: "Apex Trader Funding",
    invert: false,
    blacken: true,
  },
  {
    src: "/assets/props/myfundedfutures.svg",
    alt: "My Funded Futures",
    invert: false,
    blacken: true,
  },
  { src: "/assets/props/tradeday.webp", alt: "TradeDay", invert: false, blacken: true },
  {
    src: "/assets/props/alpha-futures.svg",
    alt: "Alpha Futures",
    invert: false,
    blacken: true,
  },

  {
    src: "/assets/props/lucidtrading.webp",
    alt: "Lucid Trading",
    invert: false,
    blacken: true,
  },
  {
    src: "/assets/props/takeprofittrader.svg",
    alt: "Take Profit Trader",
    invert: false,
    blacken: true,
  },
];

const PROP_FIRM_LOGOS = ALL_PROP_FIRM_LOGOS.filter(
  (logo) => ninjatraderEnabled || !propFirmAltHiddenUnlessNinjatrader(logo.alt)
);

/** Split logos into `numRows` contiguous groups as evenly as possible (avoids empty rows when filtering). */
function splitLogosIntoRows<T>(items: readonly T[], numRows: number): T[][] {
  if (items.length === 0) {
    return Array.from({ length: numRows }, () => []);
  }
  const base = Math.floor(items.length / numRows);
  const remainder = items.length % numRows;
  const rows: T[][] = [];
  let start = 0;
  for (let i = 0; i < numRows; i++) {
    const size = base + (i < remainder ? 1 : 0);
    rows.push(items.slice(start, start + size));
    start += size;
  }
  return rows;
}

const [ROW_1, ROW_2, ROW_3, ROW_4, ROW_5, ROW_6] = splitLogosIntoRows(
  PROP_FIRM_LOGOS,
  6
);

type Logo = { 
  src: string; 
  alt: string;
  invert?: boolean;
  blacken?: boolean;
};

type LogoRowProps = {
  logos: readonly Logo[];
  speed: number;
  direction?: "left" | "right";
};

function LogoRow({ logos, speed, direction = "left" }: LogoRowProps) {
  const allLogos = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      <div
        className="inline-flex gap-4 will-change-transform"
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
        }}
      >
        {allLogos.map((logo, idx) => {
          let filterClass = 'h-6 w-20 object-contain opacity-40 transition-all duration-300 grayscale';
          
          if (logo.blacken) {
            filterClass += ' brightness-0';
          }
          if (logo.invert) {
            filterClass += ' invert';
          }

          return (
            <div
              key={`${logo.src}-${idx}`}
              className="group shrink-0 p-3"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className={`${filterClass} ${
                  logo.blacken 
                    ? 'group-hover:brightness-0' 
                    : logo.invert 
                      ? 'group-hover:invert group-hover:grayscale-0' 
                      : 'group-hover:grayscale-0'
                } group-hover:opacity-100`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PropFirmLogosScroll({
  className,
}: PropFirmLogosScrollProps) {
  return (
    <div className={className}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-left {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          @keyframes scroll-right {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          .fade-edges {
            position: relative;
            mask-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.05) 5%,
              rgba(0, 0, 0, 0.2) 10%,
              rgba(0, 0, 0, 0.5) 15%,
              rgba(0, 0, 0, 1) 20%,
              rgba(0, 0, 0, 1) 80%,
              rgba(0, 0, 0, 0.5) 85%,
              rgba(0, 0, 0, 0.2) 90%,
              rgba(0, 0, 0, 0.05) 95%,
              rgba(0, 0, 0, 0) 100%
            );
            -webkit-mask-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.05) 5%,
              rgba(0, 0, 0, 0.2) 10%,
              rgba(0, 0, 0, 0.5) 15%,
              rgba(0, 0, 0, 1) 20%,
              rgba(0, 0, 0, 1) 80%,
              rgba(0, 0, 0, 0.5) 85%,
              rgba(0, 0, 0, 0.2) 90%,
              rgba(0, 0, 0, 0.05) 95%,
              rgba(0, 0, 0, 0) 100%
            );
          }
        `
      }} />

      <div className="relative w-full  mx-auto  overflow-hidden">
        <div className="fade-edges w-full space-y-2" aria-label="Supported prop firm brands">
          <LogoRow logos={ROW_1} speed={30} direction="left" />
          <LogoRow logos={ROW_2} speed={40} direction="right" />
          <LogoRow logos={ROW_3} speed={50} direction="left" />
          <LogoRow logos={ROW_4} speed={60} direction="right" />
          <LogoRow logos={ROW_5} speed={40} direction="left" />
          <LogoRow logos={ROW_6} speed={30} direction="right" />
        </div>
      </div>

    </div>
  );
}

