import { getAppUrl } from "@/lib/app-url";
import { getAppSettings, getUserByApiKey } from "@/lib/db/queries";
import { getStripe } from "@/lib/payments/stripe";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { releaseInfoFromSettings } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "checkout",
    windowMs: 60_000,
    max: 5,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const [foundUser, settings] = await Promise.all([
    getUserByApiKey(apiKey),
    getAppSettings(),
  ]);

  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const billingPeriod: "monthly" | "annual" =
    body.billingPeriod === "annual" ? "annual" : "monthly";

  let priceId: string | undefined | null = body.priceId;
  if (!priceId) {
    priceId =
      billingPeriod === "annual"
        ? settings.bisbiProAnnualPriceId
        : settings.bisbiProMonthlyPriceId;
  }

  if (!priceId) {
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 503 }
    );
  }

  const validPriceIds = [
    settings.bisbiProMonthlyPriceId,
    settings.bisbiProAnnualPriceId,
  ].filter(Boolean);
  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const stripe = await getStripe();
  const baseUrl = getAppUrl();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
    allow_promotion_codes: true,
    metadata: { userId: foundUser.id, productKey: "bisbi" },
    subscription_data: {
      metadata: { userId: foundUser.id, productKey: "bisbi", billingPeriod },
    },
    ...(foundUser.stripeCustomerId
      ? { customer: foundUser.stripeCustomerId }
      : { customer_email: foundUser.email }),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    return NextResponse.json(
      { error: "Checkout session could not be created" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    checkoutUrl: session.url,
    release: releaseInfoFromSettings(settings),
  });
}
