import { getAppUrl } from "@/lib/app-url";
import { getAppSettings, getUserByApiKey } from "@/lib/db/queries";
import { getStripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Called by the Bisbi desktop app to get a Stripe Checkout URL.
// Auth: Authorization: Bearer {apiKey}
// Body: { billingPeriod: "monthly" | "annual" } or { priceId: "price_xxx" }
export async function POST(request: NextRequest) {
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

  // Accept priceId from app store (already fetched from /api/license), or resolve from DB
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

  // Validate priceId is one of ours
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
    metadata: { userId: foundUser.id, productKey: "bisbi" },
    subscription_data: {
      metadata: { userId: foundUser.id, productKey: "bisbi", billingPeriod },
    },
    ...(foundUser.stripeCustomerId
      ? { customer: foundUser.stripeCustomerId }
      : { customer_email: foundUser.email }),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ checkoutUrl: session.url });
}
