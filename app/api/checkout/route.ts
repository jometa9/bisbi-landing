import { getAppUrl } from "@/lib/app-url";
import { getUserByApiKey } from "@/lib/db/queries";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRICE_IDS = {
  monthly: process.env.STRIPE_BISBI_PRO_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_BISBI_PRO_ANNUAL_PRICE_ID,
};

// Called by the Bisbi desktop app to get a Stripe Checkout URL.
// Auth: Authorization: Bearer {apiKey}
// Body: { billingPeriod: "monthly" | "annual" }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  // Accept either a direct priceId (from stored pricing) or a billingPeriod
  let priceId: string | undefined = body.priceId;
  const billingPeriod: "monthly" | "annual" =
    body.billingPeriod === "annual" ? "annual" : "monthly";
  if (!priceId) {
    priceId = PRICE_IDS[billingPeriod];
  }

  if (!priceId || priceId.startsWith("price_REPLACE")) {
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 503 }
    );
  }

  // Validate the priceId is one of ours (prevent using arbitrary Stripe price IDs)
  const validPriceIds = Object.values(PRICE_IDS).filter(Boolean);
  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const baseUrl = getAppUrl();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/checkout/success`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    metadata: {
      userId: foundUser.id,
      productKey: "bisbi",
    },
    subscription_data: {
      metadata: {
        userId: foundUser.id,
        productKey: "bisbi",
        billingPeriod,
      },
    },
    ...(foundUser.stripeCustomerId
      ? { customer: foundUser.stripeCustomerId }
      : { customer_email: foundUser.email }),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ checkoutUrl: session.url });
}
