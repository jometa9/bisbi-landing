import { db } from "@/lib/db";
import { user, userProductSubscription } from "@/lib/db/schema";
import { trackPurchase } from "@/lib/meta/conversions-api";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export interface SubscriptionPurchaseContext {
  eventSourceUrl: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
}

interface TrackSubscriptionPurchaseInput {
  userId: string;
  productKey: string;
  stripeSub: Stripe.Subscription;
  context: SubscriptionPurchaseContext;
}

export interface TrackSubscriptionPurchaseResult {
  fired: boolean;
  skipped?: "already_tracked" | "not_active" | "no_user" | "no_price" | "disabled";
  eventId?: string;
  value?: number;
  currency?: string;
}

function buildEventId(stripeSub: Stripe.Subscription): string | null {
  const periodStart = stripeSub.current_period_start;
  if (!periodStart || !stripeSub.id) return null;
  return `purchase_${stripeSub.id}_${periodStart}`;
}

export function computeSubscriptionPurchaseEventId(
  stripeSub: Stripe.Subscription
): string | null {
  return buildEventId(stripeSub);
}

export async function trackSubscriptionPurchase(
  input: TrackSubscriptionPurchaseInput
): Promise<TrackSubscriptionPurchaseResult> {
  const { userId, productKey, stripeSub, context } = input;

  if (
    stripeSub.status !== "active" &&
    stripeSub.status !== "trialing"
  ) {
    return { fired: false, skipped: "not_active" };
  }

  const eventId = buildEventId(stripeSub);
  if (!eventId) {
    return { fired: false, skipped: "no_price" };
  }

  const price = stripeSub.items.data[0]?.price;
  const unitAmount = price?.unit_amount;
  const currency = price?.currency;
  if (typeof unitAmount !== "number" || !currency) {
    return { fired: false, skipped: "no_price" };
  }
  const value = unitAmount / 100;

  const [dbSub] = await db
    .select()
    .from(userProductSubscription)
    .where(eq(userProductSubscription.stripeSubscriptionId, stripeSub.id))
    .limit(1);

  if (dbSub?.metaPurchaseEventId === eventId) {
    return { fired: false, skipped: "already_tracked", eventId };
  }

  const [foundUser] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!foundUser?.email) {
    return { fired: false, skipped: "no_user", eventId };
  }

  const [firstName, ...rest] = (foundUser.name || "").trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  const result = await trackPurchase({
    email: foundUser.email,
    firstName: firstName || undefined,
    lastName,
    value,
    currency: currency.toUpperCase(),
    contentName: productKey,
    contentIds: [stripeSub.id],
    productKey,
    eventSourceUrl: context.eventSourceUrl,
    eventId,
    clientIpAddress: context.clientIpAddress,
    clientUserAgent: context.clientUserAgent,
    fbp: context.fbp,
    fbc: context.fbc,
  });

  if (result === null) {
    return { fired: false, skipped: "disabled", eventId, value, currency };
  }

  if (dbSub) {
    await db
      .update(userProductSubscription)
      .set({ metaPurchaseEventId: eventId, updatedAt: new Date() })
      .where(eq(userProductSubscription.id, dbSub.id));
  }

  return { fired: true, eventId, value, currency: currency.toUpperCase() };
}
