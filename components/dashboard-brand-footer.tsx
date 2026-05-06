"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const CLICKS_TO_MIDNIGHT = 14;
const R0 = 229;
const G0 = 231;
const B0 = 235;

const COLOR_STEPS = CLICKS_TO_MIDNIGHT - 1;

function interpolateColor(step: number): string {
  const ratio = Math.min(step / COLOR_STEPS, 1);
  const r = Math.round(R0 * (1 - ratio));
  const g = Math.round(G0 * (1 - ratio));
  const b = Math.round(B0 * (1 - ratio));
  return `rgb(${r},${g},${b})`;
}

export function DashboardBrandFooter() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleClick = useCallback(() => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= CLICKS_TO_MIDNIGHT) {
        setTimeout(() => router.push("/midnight"), 0);
        return prev;
      }
      return next;
    });
  }, [router]);

  const color = interpolateColor(clickCount);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="select-none text-left cursor-default w-full"
      style={{ color }}
      aria-label="IPTRADE"
    >
      <p className="text-md mb-0 pb-0 leading-none">瞬写</p>
      <p className="text-xl leading-none pt-0 mt-0">IPTRADE</p>
    </button>
  );
}
