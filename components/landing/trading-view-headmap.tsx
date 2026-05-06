"use client";

import { memo, useEffect, useRef } from "react";

function TradingViewHeadmap() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    if (container.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "dark",
        "isTransparent": false,
        "locale": "en",
        "currencies": [
    "EUR",
    "USD",
    "JPY",
    "GBP",
    "CHF",
    "AUD",
    "CAD",
    "NZD",
    "CNY",
    "TRY",
    "NOK",
    "SEK",
    "DKK",
    "ZAR",
    "HKD",
    "MXN",
    "KRW",
    "THB"
  ],
        "backgroundColor": "rgba(255, 255, 255, 0)",
        "width": "100%",
        "height": "100%"
      }`;

    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container absolute inset-0 rounded-2xl pointer-events-none"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "100%", width: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}

export default memo(TradingViewHeadmap);
