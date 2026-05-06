import {
  getCurrentUserFromSession,
  getUserProductSubscription,
} from "@/lib/db/queries";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { handleSubscriptionChange } from "@/lib/payments/stripe";
import {
  getStripeSubscription,
  reconcileSubscriptionWithStripe,
} from "@/lib/subscriptions/reconcile";
import { NextResponse } from "next/server";

export async function POST() {
  if (!paymentsEnabled) {
    return NextResponse.json({ synced: false, skipped: "payments_disabled" });
  }

  const user = await getCurrentUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserProductSubscription(user.id, "multi");
  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ synced: false, skipped: "no_stripe_subscription" });
  }

  try {
    const stripeSub = await getStripeSubscription(sub.stripeSubscriptionId);
    if (!stripeSub) {
      return NextResponse.json({ synced: false, skipped: "not_found_in_stripe" });
    }

    const result = await reconcileSubscriptionWithStripe(sub, stripeSub);

    if (!result.updated && stripeSub.status === "active" && stripeSub.cancel_at_period_end && sub.status !== "canceling") {
      await handleSubscriptionChange(stripeSub, "customer.subscription.updated", { skipEmail: true });
    }

    return NextResponse.json({
      synced: result.updated,
      changes: result.changes,
    });
  } catch (error) {
    console.error("[Sync Subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
