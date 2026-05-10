import { getAppUrl } from "@/lib/app-url";
import {
  getAppSettings,
  getUserByApiKey,
  getUserProductSubscription,
} from "@/lib/db/queries";
import { getStripe } from "@/lib/payments/stripe";
import { invalidateReconcileCache } from "@/lib/subscriptions/on-demand-reconcile";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cache portal configurations keyed by (productId, monthlyPriceId, annualPriceId)
// so we don't recreate them on every billing-portal request.
const portalConfigCache = new Map<string, string>();

async function getOrCreateBisbiPortalConfiguration(
  stripe: Stripe,
  productId: string,
  monthlyPriceId: string,
  annualPriceId: string
): Promise<string> {
  const cacheKey = `${productId}|${monthlyPriceId}|${annualPriceId}`;
  const cached = portalConfigCache.get(cacheKey);
  if (cached) return cached;

  const config = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Bisbi — manage your subscription",
    },
    features: {
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
        products: [
          {
            product: productId,
            prices: [monthlyPriceId, annualPriceId],
          },
        ],
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        proration_behavior: "none",
      },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "name"],
      },
    },
  });

  portalConfigCache.set(cacheKey, config.id);
  return config.id;
}

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "billing-portal",
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

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!foundUser.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer for this user" },
      { status: 409 }
    );
  }

  const stripe = await getStripe();
  const baseUrl = getAppUrl();

  const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
    customer: foundUser.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  };

  // If the user has an active Bisbi subscription with both prices configured,
  // scope the portal to the same product's monthly/annual prices so plan
  // changes can only happen between those two — no other products are visible.
  const [sub, settings] = await Promise.all([
    getUserProductSubscription(foundUser.id, "bisbi"),
    getAppSettings(),
  ]);

  const monthlyPriceId = settings.bisbiProMonthlyPriceId;
  const annualPriceId = settings.bisbiProAnnualPriceId;
  const productId = sub?.stripeProductId ?? null;

  if (
    sub?.stripeSubscriptionId &&
    productId &&
    monthlyPriceId &&
    annualPriceId
  ) {
    sessionParams.configuration = await getOrCreateBisbiPortalConfiguration(
      stripe,
      productId,
      monthlyPriceId,
      annualPriceId
    );
  }

  const session = await stripe.billingPortal.sessions.create(sessionParams);

  // Bust the on-demand reconcile cache so the next /api/license call after the
  // user changes/cancels their plan pulls fresh state from Stripe (skipping the
  // 60s cache that would otherwise hide the change).
  invalidateReconcileCache(foundUser.id);

  return NextResponse.json({ portalUrl: session.url });
}
