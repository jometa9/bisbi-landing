"use client";

import { memo, useEffect, useRef } from "react";

function TradingViewBackground() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    if (container.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": true,
          "details": false,
          "hide_side_toolbar": false,
          "hide_top_toolbar": false,
          "hide_legend": true,
          "hide_volume": false,
          "hotlist": true,
          "interval": "1",
          "locale": "en",
          "save_image": true,
          "style": "1",
          "symbol": "FOREXCOM:BTCUSD",
          "theme": "dark",
          "timezone": "Etc/UTC",
          "backgroundColor": "rgba(255, 255, 255, 0)",
          "gridColor": "rgba(255, 255, 255, 0)",
          "watchlist": [],
          "withdateranges": true,
          "compareSymbols": [],
          "studies": [
            "MAExp@tv-basicstudies",
            "RSI@tv-basicstudies" 
          ],
          "time_scale": {
            "rightOffset": 0
          },
          "autosize": true
        }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container absolute inset-0 rounded-lg pointer-events-none"
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

export default memo(TradingViewBackground);
