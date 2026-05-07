import { getCurrentUser } from "@/lib/auth/session";
import { trackSubscriptionPurchase } from "@/lib/meta/track-subscription-purchase";
import { getStripe } from "@/lib/payments/stripe";
import { getStripeSubscription } from "@/lib/subscriptions/reconcile";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  let stripeSession;
  try {
    const stripe = await getStripe();
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  if (stripeSession.metadata?.userId !== sessionUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (stripeSession.payment_status !== "paid") {
    return NextResponse.json({ skipped: "unpaid" }, { status: 200 });
  }

  const subscriptionId =
    typeof stripeSession.subscription === "string"
      ? stripeSession.subscription
      : stripeSession.subscription?.id;
  if (!subscriptionId) {
    return NextResponse.json({ skipped: "no_subscription" }, { status: 200 });
  }

  const stripeSub = await getStripeSubscription(subscriptionId);
  if (!stripeSub) {
    return NextResponse.json({ skipped: "no_subscription" }, { status: 200 });
  }

  const productKey = stripeSession.metadata?.productKey || "bisbi";

  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;
  const xff = request.headers.get("x-forwarded-for");
  const clientIpAddress =
    xff?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;
  const clientUserAgent = request.headers.get("user-agent") || undefined;
  const origin = request.headers.get("origin") || request.nextUrl.origin;
  const eventSourceUrl = `${origin}/dashboard?checkout=success`;

  const result = await trackSubscriptionPurchase({
    userId: sessionUser.id,
    productKey,
    stripeSub,
    context: {
      eventSourceUrl,
      clientIpAddress,
      clientUserAgent,
      fbp,
      fbc,
    },
  });

  return NextResponse.json({
    fired: result.fired,
    skipped: result.skipped,
    eventId: result.eventId,
    value: result.value,
    currency: result.currency,
  });
}
