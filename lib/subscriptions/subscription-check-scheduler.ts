import { db } from "@/lib/db";
import { userProductSubscription } from "@/lib/db/schema";
import { and, or, lt, eq, isNotNull } from "drizzle-orm";
import { getStripe } from "@/lib/payments/stripe";
import type Stripe from "stripe";
import {
  reconcileSubscriptionWithStripe,
  getStripeSubscription,
  markSubscriptionAsCanceled,
} from "./reconcile";
import { executeWithLock } from "@/lib/cron/distributed-lock";
import { trackSubscriptionPurchase } from "@/lib/meta/track-subscription-purchase";
import { getAppUrl } from "@/lib/app-url";
import { deleteExpiredSeenBatches } from "@/lib/db/queries";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

let checkInterval: NodeJS.Timeout | null = null;

export interface SubscriptionCheckResult {
  checked: number;
  reconciledWithStripe: number;
  localExpired: number;
  cancelingToCanceled: number;
  seenBatchesPurged: number;
  errors: string[];
}

async function reconcileSubscription(
  sub: typeof userProductSubscription.$inferSelect
): Promise<{ updated: boolean; error?: string }> {
  if (!sub.stripeSubscriptionId) {
    return { updated: false };
  }

  let stripeSub: Stripe.Subscription | null = null;
  try {
    stripeSub = await getStripeSubscription(sub.stripeSubscriptionId);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Subscription Check] Temporary error retrieving subscription ${sub.stripeSubscriptionId}, skipping:`, errorMessage);
    return { updated: false, error: errorMessage };
  }

  if (!stripeSub) {
    const now = new Date();
    const isExpired = sub.expiresAt && sub.expiresAt < now;
    const isAlreadyCanceled = sub.status === "canceled" || sub.status === "incomplete_expired";

    if (isExpired || isAlreadyCanceled) {
      await markSubscriptionAsCanceled(
        sub.id,
        `Subscription not found in Stripe (${isExpired ? 'expired' : 'already canceled'})`
      );
      return { updated: true };
    } else {
      return { updated: false, error: 'Subscription not found in Stripe but still active - skipped' };
    }
  }

  try {
    const result = await reconcileSubscriptionWithStripe(sub, stripeSub);

    if (sub.productKey === "bisbi") {
      try {
        await trackSubscriptionPurchase({
          userId: sub.userId,
          productKey: sub.productKey,
          stripeSub,
          context: {
            eventSourceUrl: `${getAppUrl()}/dashboard?checkout=success`,
          },
        });
      } catch (metaError: unknown) {
        const metaErrorMessage =
          metaError instanceof Error ? metaError.message : String(metaError);
        console.error(
          `[Subscription Check] Meta Purchase tracking failed for ${sub.id}:`,
          metaErrorMessage
        );
      }
    }

    return {
      updated: result.updated,
      error: result.error,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Subscription Check] Error reconciling ${sub.id}:`, errorMessage);
    return { updated: false, error: errorMessage };
  }
}

export async function runSubscriptionCheck(): Promise<SubscriptionCheckResult> {
  const errors: string[] = [];
  let reconciledWithStripe = 0;
  let localExpired = 0;
  let cancelingToCanceled = 0;

  try {
    const now = new Date();

    const subscriptionsWithStripeId = await db
      .select()
      .from(userProductSubscription)
      .where(
        and(
          isNotNull(userProductSubscription.stripeSubscriptionId),
          or(
            eq(userProductSubscription.status, "active"),
            eq(userProductSubscription.status, "trialing"),
            eq(userProductSubscription.status, "canceling"),
            eq(userProductSubscription.status, "past_due")
          )
        )
      );

    for (const sub of subscriptionsWithStripeId) {
      const result = await reconcileSubscription(sub);
      if (result.updated) {
        reconciledWithStripe++;
      }
      if (result.error) {
        errors.push(`Error reconciling ${sub.id}: ${result.error}`);
      }
    }

    const expiredLocalSubscriptions = await db
      .select()
      .from(userProductSubscription)
      .where(
        and(
          isNotNull(userProductSubscription.expiresAt),
          lt(userProductSubscription.expiresAt, now),
          or(
            eq(userProductSubscription.status, "active"),
            eq(userProductSubscription.status, "trialing")
          ),
          eq(userProductSubscription.stripeSubscriptionId, null as unknown as string)
        )
      );

    for (const sub of expiredLocalSubscriptions) {
      try {
        await db
          .update(userProductSubscription)
          .set({
            status: "expired",
            updatedAt: now,
          })
          .where(eq(userProductSubscription.id, sub.id));

        localExpired++;
      } catch (error) {
        const errorMsg = `Error expiring subscription ${sub.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`[Subscription Check] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const bufferTime = 5 * 60 * 1000;
    const expiryThreshold = new Date(now.getTime() - bufferTime);
    
    const cancelingExpired = await db
      .select()
      .from(userProductSubscription)
      .where(
        and(
          isNotNull(userProductSubscription.expiresAt),
          lt(userProductSubscription.expiresAt, expiryThreshold),
          eq(userProductSubscription.status, "canceling")
        )
      );

    for (const sub of cancelingExpired) {
      try {
        if (sub.stripeSubscriptionId) {
          try {
            const stripe = await getStripe();
            const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);

            if (stripeSub.status === "active" && stripeSub.cancel_at_period_end) {
              const stripeExpiresAt = new Date(stripeSub.current_period_end * 1000);
              if (stripeExpiresAt > now) {
                await db
                  .update(userProductSubscription)
                  .set({
                    expiresAt: stripeExpiresAt,
                    updatedAt: now,
                  })
                  .where(eq(userProductSubscription.id, sub.id));
                continue;
              }
            }

            if (stripeSub.status === "canceled" || stripeSub.status === "incomplete_expired") {
            } else {
              continue;
            }
          } catch (stripeError: unknown) {
            const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
            if (errorMessage.includes("No such subscription") || errorMessage.includes("resource_missing")) {
            } else {
              console.error(`[Subscription Check] Temporary error checking Stripe for canceling subscription ${sub.id}, skipping cancellation:`, errorMessage);
              continue;
            }
          }
        }

        await db
          .update(userProductSubscription)
          .set({
            status: "canceled",
            updatedAt: now,
          })
          .where(eq(userProductSubscription.id, sub.id));

        cancelingToCanceled++;
      } catch (error) {
        const errorMsg = `Error canceling subscription ${sub.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`[Subscription Check] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    let seenBatchesPurged = 0;
    try {
      seenBatchesPurged = await deleteExpiredSeenBatches();
    } catch (error) {
      const errorMsg = `Error purging expired seenBatch rows: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Subscription Check] ${errorMsg}`);
      errors.push(errorMsg);
    }

    const totalChecked = subscriptionsWithStripeId.length + expiredLocalSubscriptions.length + cancelingExpired.length;

    return {
      checked: totalChecked,
      reconciledWithStripe,
      localExpired,
      cancelingToCanceled,
      seenBatchesPurged,
      errors,
    };
  } catch (error) {
    const errorMsg = `Job failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[Subscription Check] ${errorMsg}`);
    return {
      checked: 0,
      reconciledWithStripe: 0,
      localExpired: 0,
      cancelingToCanceled: 0,
      seenBatchesPurged: 0,
      errors: [errorMsg],
    };
  }
}

export function startSubscriptionCheckScheduler() {
  if (checkInterval) {
    return;
  }

  executeWithLock(
    "subscription-check-scheduler",
    1004,
    runSubscriptionCheck,
    {
      timeout: 10 * 60 * 1000,
    }
  ).then(() => {});

  checkInterval = setInterval(async () => {
    const lockResult = await executeWithLock(
      "subscription-check-scheduler",
      1004,
      runSubscriptionCheck,
      {
        timeout: 10 * 60 * 1000,
      }
    );

    if (lockResult.error) {
      console.error(`[Subscription Check] Failed: ${lockResult.error}`);
    }
  }, CHECK_INTERVAL_MS);
}

export function stopSubscriptionCheckScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
