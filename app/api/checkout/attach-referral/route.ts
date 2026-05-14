import { getStripe } from "@/lib/payments/stripe";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "checkout-attach-referral",
    windowMs: 60_000,
    max: 20,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const body = await request.json().catch(() => ({}));
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId : null;
  const referral =
    typeof body.referral === "string" ? body.referral.trim() : null;

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
  }
  if (!referral || referral.length > 200) {
    return NextResponse.json({ error: "Invalid referral" }, { status: 400 });
  }

  const stripe = await getStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "open") {
    return NextResponse.json({ skipped: "not_open" }, { status: 200 });
  }
  if (session.metadata?.tolt_referral) {
    return NextResponse.json({ skipped: "already_set" }, { status: 200 });
  }

  await stripe.checkout.sessions.update(sessionId, {
    metadata: {
      ...(session.metadata || {}),
      tolt_referral: referral,
    },
  });

  return NextResponse.json({ ok: true });
}
