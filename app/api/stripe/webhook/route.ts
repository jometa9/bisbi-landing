import { db } from "@/lib/db/drizzle";
import {
  getProductSubscriptionByStripeId,
  getUserByStripeCustomerId,
  upsertProductSubscription,
} from "@/lib/db/queries";
import { user } from "@/lib/db/schema";
import { stripe } from "@/lib/payments/stripe";
import {
  getStripeSubscription,
  reconcileSubscriptionWithStripe,
} from "@/lib/subscriptions/reconcile";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const productKey = (session.metadata?.productKey as "bisbi" | "multi") || "bisbi";
        if (!userId) break;

        // Save Stripe customer ID on user if not already set
        const customerId = session.customer as string | null;
        if (customerId) {
          await db
            .update(user)
            .set({ stripeCustomerId: customerId, updatedAt: new Date() })
            .where(eq(user.id, userId));
        }

        const subscriptionId = session.subscription as string | null;
        if (!subscriptionId) break;

        const stripeSub = await getStripeSubscription(subscriptionId);
        if (!stripeSub) break;

        const billingPeriod =
          stripeSub.items.data[0]?.price?.recurring?.interval === "year"
            ? "annual"
            : "monthly";

        await upsertProductSubscription(userId, productKey, {
          tier: "pro",
          status: "active",
          billingPeriod,
          stripeSubscriptionId: subscriptionId,
          stripeProductId:
            typeof stripeSub.items.data[0]?.price?.product === "string"
              ? stripeSub.items.data[0].price.product
              : null,
          planName: "Bisbi Pro",
          expiresAt: stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : null,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const existing = await getProductSubscriptionByStripeId(stripeSub.id);
        if (!existing) break;

        await reconcileSubscriptionWithStripe(existing, stripeSub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : null;
        if (!subscriptionId) break;

        const existing = await getProductSubscriptionByStripeId(subscriptionId);
        if (!existing) break;

        await upsertProductSubscription(existing.userId, existing.productKey as "bisbi" | "multi", {
          status: "past_due",
        });
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error handling event:", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
