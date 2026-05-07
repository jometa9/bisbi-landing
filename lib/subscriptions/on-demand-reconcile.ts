import { getStripe } from "@/lib/payments/stripe";
import {
  getProductSubscriptionByStripeId,
  upsertProductSubscription,
} from "@/lib/db/queries";
import { reconcileSubscriptionWithStripe } from "./reconcile";
import type Stripe from "stripe";

const CACHE_TTL_MS = 60 * 1000;
const lastReconciledByUser = new Map<string, number>();

function shouldSkip(userId: string): boolean {
  const last = lastReconciledByUser.get(userId);
  if (!last) return false;
  return Date.now() - last < CACHE_TTL_MS;
}

function markReconciled(userId: string) {
  lastReconciledByUser.set(userId, Date.now());
}

export async function reconcileUserFromStripe(
  userId: string,
  stripeCustomerId: string | null | undefined
): Promise<void> {
  if (!stripeCustomerId) return;
  if (shouldSkip(userId)) return;

  try {
    const stripe = await getStripe();
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
      expand: ["data.items.data.price.product"],
    });

    for (const stripeSub of subs.data) {
      await reconcileOne(userId, stripeSub);
    }

    markReconciled(userId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[OnDemandReconcile] Failed for user ${userId}:`, msg);
  }
}

async function reconcileOne(
  userId: string,
  stripeSub: Stripe.Subscription
): Promise<void> {
  const existing = await getProductSubscriptionByStripeId(stripeSub.id);

  if (existing) {
    await reconcileSubscriptionWithStripe(existing, stripeSub);
    return;
  }

  const isActiveLike =
    stripeSub.status === "active" ||
    stripeSub.status === "trialing" ||
    stripeSub.status === "past_due";
  if (!isActiveLike) return;

  const price = stripeSub.items.data[0]?.price;
  const billingPeriod =
    price?.recurring?.interval === "year" ? "annual" : "monthly";

  const product = price?.product;
  let planName: string | null = "Bisbi Pro";
  let stripeProductId: string | null = null;
  if (product && typeof product === "object" && "name" in product) {
    planName = (product.name as string) || planName;
    stripeProductId = (product as Stripe.Product).id ?? null;
  } else if (typeof product === "string") {
    stripeProductId = product;
  }

  const status =
    stripeSub.status === "active" && stripeSub.cancel_at_period_end
      ? "canceling"
      : stripeSub.status;

  await upsertProductSubscription(userId, "bisbi", {
    tier: "pro",
    status,
    billingPeriod,
    stripeSubscriptionId: stripeSub.id,
    stripeProductId,
    planName,
    expiresAt: stripeSub.current_period_end
      ? new Date(stripeSub.current_period_end * 1000)
      : null,
  });
}
