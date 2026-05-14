"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    tolt_referral?: string;
  }
}

const MAX_WAIT_MS = 1500;
const POLL_INTERVAL_MS = 100;

async function waitForReferral(): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    if (typeof window.tolt_referral === "string" && window.tolt_referral) {
      return window.tolt_referral;
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return null;
}

export default function RedirectClient({
  sessionId,
  stripeUrl,
}: {
  sessionId: string;
  stripeUrl: string;
}) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      try {
        const referral = await waitForReferral();
        if (referral) {
          await fetch("/api/checkout/attach-referral", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, referral }),
          }).catch(() => {});
        }
      } finally {
        window.location.replace(stripeUrl);
      }
    };

    void run();
  }, [sessionId, stripeUrl]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        color: "#1A1A18",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ fontSize: 14, opacity: 0.6 }}>Redirigiendo al checkout…</p>
    </div>
  );
}
