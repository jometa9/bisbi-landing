import { db } from "@/lib/db";
import { userProductSubscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/payments/stripe";
import Stripe from "stripe";

export interface ReconcileResult {
  updated: boolean;
  changes?: {
    status?: boolean;
    expiresAt?: boolean;
    billingPeriod?: boolean;
    accountLimit?: boolean;
    tier?: boolean;
  };
  error?: string;
}

export async function reconcileSubscriptionWithStripe(
  sub: typeof userProductSubscription.$inferSelect,
  stripeSub: Stripe.Subscription
): Promise<ReconcileResult> {
  const now = new Date();
  let needsUpdate = false;
  const updateData: Record<string, unknown> = { updatedAt: now };
  const changes: ReconcileResult['changes'] = {};

  const stripeStatus = stripeSub.status;
  const stripeExpiresAt = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;
  const stripeCancelAtPeriodEnd = stripeSub.cancel_at_period_end;

  const price = stripeSub.items.data[0]?.price;
  let stripeBillingPeriod: "monthly" | "annual" | null = null;
  if (price?.recurring?.interval === "year") {
    stripeBillingPeriod = "annual";
  } else if (price?.recurring?.interval === "month") {
    stripeBillingPeriod = "monthly";
  }

  let stripeTier: "unlimited" | "pro" | "free" = "free";
  if (sub.productKey === "multi") {
    const product = price?.product;
    if (product && typeof product === "object" && "name" in product) {
      const productName = (product.name as string).toLowerCase();
      if (productName.includes("unlimited")) {
        stripeTier = "unlimited";
      } else if (productName.includes("pro")) {
        stripeTier = "pro";
      }
    }
  }

  let correctLocalStatus: string = stripeStatus;
  if (stripeStatus === "active" && stripeCancelAtPeriodEnd) {
    correctLocalStatus = "canceling";
  }

  if (sub.status !== correctLocalStatus  ) {
    updateData.status = correctLocalStatus;
    changes.status = true;
    needsUpdate = true;
  }

  if (stripeExpiresAt) {
    const localExpires = sub.expiresAt?.getTime() || 0;
    const stripeExpires = stripeExpiresAt.getTime();
    if (Math.abs(localExpires - stripeExpires) > 60000) {
      updateData.expiresAt = stripeExpiresAt;
      changes.expiresAt = true;
      needsUpdate = true;
    }
  }

  if (stripeBillingPeriod && sub.billingPeriod !== stripeBillingPeriod) {
    updateData.billingPeriod = stripeBillingPeriod;
    changes.billingPeriod = true;
    needsUpdate = true;
  }

  if (sub.productKey === "multi" && stripeTier !== "free" && sub.tier !== stripeTier) {
    updateData.tier = stripeTier;
    changes.tier = true;
    needsUpdate = true;
  }

  if (
    stripeStatus === "canceled" ||
    stripeStatus === "unpaid" ||
    stripeStatus === "incomplete_expired"
  ) {

    if (sub.status !== stripeStatus) {
      updateData.status = stripeStatus;
      changes.status = true;
      needsUpdate = true;
    }

    if (stripeExpiresAt && stripeExpiresAt > now) {
      if (sub.expiresAt?.getTime() !== stripeExpiresAt.getTime()) {
        updateData.expiresAt = stripeExpiresAt;
        changes.expiresAt = true;
        needsUpdate = true;
      }
    } else {
      if (sub.expiresAt?.getTime() !== now.getTime()) {
        updateData.expiresAt = now;
        changes.expiresAt = true;
        needsUpdate = true;
      }
    }
  }

  if (needsUpdate) {
    await db
      .update(userProductSubscription)
      .set(updateData)
      .where(eq(userProductSubscription.id, sub.id));

    if (changes.billingPeriod && stripeBillingPeriod && sub.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          metadata: {
            ...stripeSub.metadata,
            billingPeriod: stripeBillingPeriod,
          },
        });
      } catch {
      }
    }
  }

  return {
    updated: needsUpdate,
    changes: needsUpdate ? changes : undefined,
  };
}

export async function getStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ["items.data.price.product"],
    });
    return stripeSub;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("No such subscription") ||
      errorMessage.includes("resource_missing")
    ) {
      return null;
    }

    console.error(`[Reconcile] Error retrieving Stripe subscription ${stripeSubscriptionId}:`, errorMessage);
    throw error;
  }
}

export async function markSubscriptionAsCanceled(
  subscriptionId: number,
  reason: string
): Promise<void> {
  const now = new Date();

  const currentSub = await db
    .select()
    .from(userProductSubscription)
    .where(eq(userProductSubscription.id, subscriptionId))
    .limit(1);
  
  if (currentSub.length === 0) {
    return;
  }

  const sub = currentSub[0];
  
  await db
    .update(userProductSubscription)
    .set({
      status: "canceled",
      stripeSubscriptionId: sub.stripeSubscriptionId,
      stripeProductId: sub.stripeProductId,
      expiresAt: now,
      updatedAt: now,
    })
    .where(eq(userProductSubscription.id, subscriptionId));
}

