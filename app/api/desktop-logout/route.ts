import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { getReleaseInfo } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "desktop-logout",
    windowMs: 60_000,
    max: 10,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const release = await getReleaseInfo();
  return NextResponse.json({ ok: true, revoked: false, release });
}
