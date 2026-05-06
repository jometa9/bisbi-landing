import { getUser, getUserProductSubscription, updateUserById } from "@/lib/db/queries";
import { ProductKey } from "@/lib/db/schema";
import {
  extractClientInfo,
  extractFacebookCookies,
  generateEventId,
  trackInitiateCheckout,
} from "@/lib/meta";
import { getAppUrl } from "@/lib/app-url";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { createCheckoutSession, getStripe, handleSubscriptionChange } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";

type SupportedProductKey = "multi";

interface CheckoutRequestBody {
  priceId?: string;
  productKey: SupportedProductKey;
  tier?: "pro" | "unlimited";
  billingPeriod?: "monthly" | "annual";
  cancelUrl?: string;
  metaEventId?: string;
  metaValue?: number;
  metaCurrency?: string;
  metaContentName?: string;
}

const DASHBOARD_ROUTES: Record<SupportedProductKey, string> = {
  multi: "/dashboard",
};

export async function POST(request: NextRequest) {
  try {
    if (!paymentsEnabled) {
      return NextResponse.json(
        { error: "Payments are temporarily disabled" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const {
      priceId,
      productKey,
      tier,
      billingPeriod = "monthly",
      cancelUrl,
      metaEventId,
      metaValue,
      metaCurrency,
      metaContentName,
    } = body;

    if (!productKey || productKey !== "multi") {
      return NextResponse.json(
        { error: "Product key must be 'multi'" },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    if (!priceId || !priceId.startsWith("price_")) {
      return NextResponse.json(
        { error: "Invalid price ID format" },
        { status: 400 }
      );
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          redirect: `/sign-in?redirect=${DASHBOARD_ROUTES[productKey]}`,
        },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await updateUserById(user.id, { stripeCustomerId: customerId });
    }

    const existingSubscription = await getUserProductSubscription(user.id, productKey as ProductKey);
    
    let hasActiveStripeSubscription = false;
    let currentStripeSub = null;
    
    if (existingSubscription?.stripeSubscriptionId) {
      try {
        currentStripeSub = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
        hasActiveStripeSubscription = (currentStripeSub.status === "active" || currentStripeSub.status === "trialing") &&
                                      (existingSubscription.status === "active" || 
                                       existingSubscription.status === "trialing" || 
                                       existingSubscription.status === "canceling");
        
        const currentPriceId = currentStripeSub.items.data[0]?.price.id;
        
        if (currentPriceId === priceId) {
          return NextResponse.json({
            success: true,
            message: "You already have this plan",
            redirect: DASHBOARD_ROUTES[productKey],
          });
        }
      } catch {
        hasActiveStripeSubscription = false;
      }
    }

    if (hasActiveStripeSubscription && currentStripeSub) {
      const currentItem = currentStripeSub.items.data[0];
      if (!currentItem) {
        return NextResponse.json({ error: "Invalid subscription state" }, { status: 400 });
      }

      const updatedSub = await stripe.subscriptions.update(currentStripeSub.id, {
        items: [{
          id: currentItem.id,
          price: priceId,
        }],
        proration_behavior: "create_prorations",
        metadata: {
          ...currentStripeSub.metadata,
          productKey,
          ...(tier && { tier }),
          billingPeriod,
        },
      });

      const expandedSub = await stripe.subscriptions.retrieve(updatedSub.id, {
        expand: ["items.data.price.product"],
      });
      await handleSubscriptionChange(expandedSub, "customer.subscription.updated", { skipEmail: true });

      const openInvoices = await stripe.invoices.list({
        subscription: updatedSub.id,
        status: "open",
        limit: 1,
      });

      if (openInvoices.data.length > 0 && openInvoices.data[0].amount_due > 0) {
        const invoice = openInvoices.data[0];
        const invoiceUrl = invoice.hosted_invoice_url;
        if (invoiceUrl) {
          return NextResponse.json({
            success: true,
            message: "Plan updated - please complete payment",
            redirect: invoiceUrl,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Plan updated successfully",
        redirect: DASHBOARD_ROUTES[productKey],
      });
    }

    const metadata: Record<string, string> = {
      productKey,
      billingPeriod,
      tier: tier || "unlimited",
    };

    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: user.id,
      email: user.email,
      customerId,
      metadata,
      cancelUrl,
    });

    try {
      const eventId = metaEventId || generateEventId();
      const { fbc, fbp } = extractFacebookCookies(request);
      const { clientIpAddress, clientUserAgent } = extractClientInfo(request);
      await trackInitiateCheckout({
        email: user.email,
        value: metaValue,
        currency: metaCurrency ?? "USD",
        contentName: metaContentName ?? `${tier ?? "unlimited"} (${productKey.toUpperCase()})`,
        contentCategory: "subscription",
        productKey: productKey as ProductKey,
        eventSourceUrl: new URL("/dashboard/pricing", getAppUrl()).toString(),
        eventId,
        clientIpAddress,
        clientUserAgent,
        fbc,
        fbp,
      });
    } catch (metaError) {
      console.error("[Checkout] Meta Conversions API InitiateCheckout:", metaError);
    }

    if (!checkoutSession?.url) {
      return NextResponse.json(
        { error: "Unable to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { redirect: checkoutSession.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      {
        error: "Checkout failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
