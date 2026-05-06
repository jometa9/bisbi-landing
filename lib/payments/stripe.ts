import {
  getUserByStripeCustomerId,
  updateUserById,
  getProductSubscriptionByStripeId,
  upsertProductSubscription,
  getUserProductSubscriptions,
} from "@/lib/db/queries";
import { User, ProductKey } from "@/lib/db/schema";
import { getAppUrl } from "@/lib/app-url";
import { sendSubscriptionChangeEmail } from "@/lib/email";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey || !apiKey.startsWith("sk_")) {
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          if (
            prop === "checkout" ||
            prop === "customers" ||
            prop === "billingPortal" ||
            prop === "products" ||
            prop === "prices" ||
            prop === "subscriptions" ||
            prop === "subscriptionSchedules"
          ) {
            return new Proxy(
              {},
              {
                get: () => {
                  return () => {
                    throw new Error(
                      "Stripe is not configured correctly. Add a valid Stripe key in your .env.local file"
                    );
                  };
                },
              }
            );
          }
          return () => {
            throw new Error(
              "Stripe is not configured correctly. Add a valid Stripe key in your .env.local file"
            );
          };
        },
      }
    ) as unknown as Stripe;
  }

  stripeInstance = new Stripe(apiKey, {
    apiVersion: "2025-02-24.acacia",
  });

  return stripeInstance;
}

export const stripe = getStripe();

export async function cancelOtherProductSubscriptions(
  userId: string,
  newProductKey: ProductKey
): Promise<string[]> {
  const canceledSubscriptionIds: string[] = [];

  try {
    const allSubscriptions = await getUserProductSubscriptions(userId);
    const subscriptionsToCancel = allSubscriptions.filter(
      (sub) =>
        sub.productKey !== newProductKey &&
        sub.stripeSubscriptionId &&
        (sub.status === "active" || sub.status === "trialing")
    );
    
    if (subscriptionsToCancel.length === 0) {
      return canceledSubscriptionIds;
    }

    for (const subscription of subscriptionsToCancel) {
      if (!subscription.stripeSubscriptionId) continue;

      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          metadata: {
            ...stripeSub.metadata,
            isPlanChange: "true",
            isProductSwitch: "true",
            newPlanProductKey: newProductKey,
          },
        });
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        canceledSubscriptionIds.push(subscription.stripeSubscriptionId);
      } catch (cancelError) {
        console.error(
          `[Cancel Other Subscriptions] Error canceling ${subscription.productKey} subscription ${subscription.stripeSubscriptionId}:`,
          cancelError
        );
      }
    }
    
    return canceledSubscriptionIds;
  } catch (error) {
    console.error("[Cancel Other Subscriptions] Error getting user subscriptions:", error);
    return canceledSubscriptionIds;
  }
}

export type InvoiceSummary = {
  id: string;
  number: string | null;
  total: number | null;
  currency: string | null;
  status: Stripe.Invoice.Status | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  created: number;
};

export async function createCheckoutSession({
  priceId,
  userId,
  email,
  customerId,
  metadata,
  successUrl,
  cancelUrl,
  quantity,
}: {
  priceId: string;
  userId: string;
  email: string;
  customerId?: string | null;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
  quantity?: number;
}) {
  try {
    const stripeClient = getStripe();
    let customerIdToUse = customerId;

    if (!customerIdToUse) {
      try {
        const customer = await stripeClient.customers.create({
          email: email,
          metadata: {
            userId: userId,
          },
        });

        customerIdToUse = customer.id;

        await updateUserById(userId, {
          stripeCustomerId: customer.id,
        });
      } catch {
        throw new Error("customer-error");
      }
    }

    const baseUrl = getAppUrl();
    const successUrlToUse =
      successUrl ||
      `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrlToUse = cancelUrl || `${baseUrl}/dashboard/pricing`;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      mode: "subscription",
      success_url: successUrlToUse,
      cancel_url: cancelUrlToUse,
      customer: customerIdToUse,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        ...metadata,
      },
    };

    try {
      const session = await stripeClient.checkout.sessions.create(sessionConfig);

      if (!session.url) {
        throw new Error("checkout-creation-failed");
      }

      return session;
    } catch (checkoutError: unknown) {
      const errorCode =
        checkoutError &&
        typeof checkoutError === "object" &&
        "code" in checkoutError
          ? (checkoutError as { code: string }).code
          : undefined;
      const errorMessage =
        checkoutError &&
        typeof checkoutError === "object" &&
        "message" in checkoutError
          ? String((checkoutError as { message: string }).message)
          : "";
      
      if (
        errorCode === "resource_missing" &&
        errorMessage.includes("No such customer") &&
        customerIdToUse
      ) {
        const newCustomer = await stripeClient.customers.create({
          email: email,
          metadata: {
            userId: userId,
          },
        });

        customerIdToUse = newCustomer.id;

        await updateUserById(userId, {
          stripeCustomerId: newCustomer.id,
        });

        const retrySessionConfig = {
          ...sessionConfig,
          customer: customerIdToUse,
        };

        const session = await stripeClient.checkout.sessions.create(retrySessionConfig);

        if (!session.url) {
          throw new Error("checkout-creation-failed");
        }

        return session;
      }

      throw checkoutError;
    }
  } catch (error) {
    throw error;
  }
}

function getTierPriceIds(productKey: ProductKey, tier: "pro" | "unlimited"): string[] {
  const prices: (string | undefined)[] = [];
  if (tier === "pro") {
    prices.push(
      process.env.STRIPE_MULTI_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_MULTI_PRO_ANNUAL_PRICE_ID,
    );
  }
  if (tier === "unlimited") {
    prices.push(
      process.env.STRIPE_MULTI_UNLIMITED_MONTHLY_PRICE_ID,
      process.env.STRIPE_MULTI_UNLIMITED_ANNUAL_PRICE_ID,
    );
  }
  return prices.filter((p): p is string => !!p);
}

async function getStripeProductIdsForProduct(priceIds: string[]): Promise<string[]> {
  const productIds = new Set<string>();
  
  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      productIds.add(productId);
    } catch (error) {
      console.error(`Error retrieving price ${priceId}:`, error);
    }
  }
  
  return Array.from(productIds);
}

export async function createCustomerPortalSession(
  user: User,
  stripeSubscriptionId?: string | null,
  stripeProductId?: string | null,
  productKey?: ProductKey,
  tier?: "pro" | "unlimited"
): Promise<{ url: string } | { error: string; message?: string }> {
  if (!user.stripeCustomerId) {
    return { error: "no-customer-id" };
  }

  try {
    let productId: string | null = stripeProductId || null;

    if (stripeSubscriptionId && !productId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        if (subscription.items.data.length > 0) {
          const price = subscription.items.data[0].price;
          if (price && typeof price.product === "string") {
            productId = price.product;
          } else if (price && typeof price.product === "object") {
            productId = price.product.id;
          }
        }
      } catch (error) {
        console.error("Error retrieving subscription:", error);
      }
    }

    if (!productId) {
      return { error: "no-product-id" };
    }

    const returnUrl = `${getAppUrl()}/dashboard/pricing`;

    let configuration: Stripe.BillingPortal.Configuration;

    if (productKey && tier) {
      const priceIds = getTierPriceIds(productKey, tier);
      const stripeProductIds = await getStripeProductIdsForProduct(priceIds);

      if (stripeProductIds.length > 0 && priceIds.length > 0) {
        const expectedHeadline = `IPTRADE ${productKey.toUpperCase()} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`;
        let existingConfig: Stripe.BillingPortal.Configuration | null = null;
        try {
          const configurations = await stripe.billingPortal.configurations.list({
            limit: 25,
          });
          existingConfig = configurations.data.find(
            (c) => c.business_profile?.headline === expectedHeadline
          ) || null;
        } catch (error) {
          console.error("Error listing portal configurations:", error);
        }

        if (existingConfig) {
          configuration = existingConfig;
        } else {
          const productsConfig = stripeProductIds.map(pid => ({
            product: pid,
            prices: priceIds,
          }));
          
          try {
            configuration = await stripe.billingPortal.configurations.create({
              business_profile: {
                headline: expectedHeadline,
              },
              features: {
                payment_method_update: {
                  enabled: true,
                },
                invoice_history: {
                  enabled: true,
                },
                subscription_cancel: {
                  enabled: true,
                  mode: "at_period_end",
                  cancellation_reason: {
                    enabled: true,
                    options: [
                      "too_expensive",
                      "missing_features",
                      "switched_service",
                      "unused",
                      "other",
                    ],
                  },
                },
                subscription_update: {
                  enabled: true,
                  default_allowed_updates: ["price"],
                  proration_behavior: "create_prorations",
                  products: productsConfig,
                },
              },
            });
          } catch (configError) {
            console.error("Error creating product-specific portal config:", configError);
            configuration = await getOrCreateBasicPortalConfiguration();
          }
        }
      } else {
        configuration = await getOrCreateBasicPortalConfiguration();
      }
    } else {
      configuration = await getOrCreateBasicPortalConfiguration();
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      configuration: configuration.id,
    });

    if (!session.url) {
      console.error("Stripe portal session created but URL is missing", {
        sessionId: session.id,
        customerId: user.stripeCustomerId,
      });
      return { error: "portal-access" };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Error creating Stripe customer portal session:", {
      error: error instanceof Error ? error.message : String(error),
      customerId: user.stripeCustomerId,
    });

    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("stripe")
      ) {
        return { error: "stripe-api-key" };
      } else if (error.message.includes("configuration")) {
        return { error: "portal-config" };
      } else if (error.message.includes("customer")) {
        return { error: "invalid-customer" };
      } else if (error.message.includes("product")) {
        if (error.message.includes("test mode")) {
          return {
            error: "product-mode-mismatch",
            message:
              "Your subscription product was created in test mode, but you're using production mode. Please contact support.",
          };
        }
        return { error: "no-product-id" };
      } else if (error.message.includes("test mode")) {
        return {
          error: "product-mode-mismatch",
          message:
            "Your subscription was created in test mode, but you're using production mode. Please contact support.",
        };
      }
    }

    return { error: "portal-access" };
  }
}

async function getOrCreateBasicPortalConfiguration(): Promise<Stripe.BillingPortal.Configuration> {
  let configurations;
  try {
    configurations = await stripe.billingPortal.configurations.list({
      limit: 10,
    });
  } catch (error) {
    console.error("Error listing portal configurations:", error);
    throw new Error("Failed to access portal configurations");
  }

  const basicConfig = configurations.data.find(
    (c) => !c.features.subscription_update?.products?.length
  );

  if (basicConfig) {
    return basicConfig;
  }

  return stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your subscription",
    },
    features: {
      payment_method_update: {
        enabled: true,
      },
      invoice_history: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
    },
  });
}

function getProductKeyFromSubscription(_subscription: Stripe.Subscription): ProductKey {
  return "multi";
}

function getTierFromPlanName(planName: string | null): string {
  if (!planName) return "free";
  const lowerName = planName.toLowerCase();
  if (lowerName.includes("unlimited")) return "unlimited";
  if (lowerName.includes("pro")) return "pro";
  return "free";
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  eventType?: string,
  options?: { skipEmail?: boolean }
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error("[Stripe] User not found for customer:", customerId);
    return;
  }

  const isPlanChange = subscription.metadata?.isPlanChange === "true";
  const isProductSwitch = subscription.metadata?.isProductSwitch === "true";

  const productKey = getProductKeyFromSubscription(subscription);

  let planName: string | null = null;
  const plan = subscription.items.data[0]?.plan;

  if (plan && typeof plan.product === "string") {
    try {
      const product = await stripe.products.retrieve(plan.product);
      planName = product.name;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[Stripe] Error retrieving product:", {
        productId: plan.product,
        error: errorMessage,
      });
    }
  } else if (plan && typeof plan.product === "object" && plan.product && "name" in plan.product) {
    planName = plan.product.name;
  }

  const tier = getTierFromPlanName(planName);

  const expiryDate = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const expiryDateString = expiryDate
    ? expiryDate.toISOString().split("T")[0]
    : undefined;

  let billingPeriod: "monthly" | "annual" | null = null;
  const price = subscription.items.data[0]?.price;
  if (price?.recurring?.interval === "year") {
    billingPeriod = "annual";
  } else if (price?.recurring?.interval === "month") {
    billingPeriod = "monthly";
  }

  const existingProductSub = await getProductSubscriptionByStripeId(subscriptionId);

  if (
    status === "active" &&
    !cancelAtPeriodEnd &&
    existingProductSub?.status === "canceling" &&
    eventType === "customer.subscription.updated"
  ) {
    await upsertProductSubscription(user.id, productKey, {
      tier,
      status: "active",
      billingPeriod,
      stripeSubscriptionId: subscriptionId,
      stripeProductId:
        typeof plan?.product === "string"
          ? plan?.product
          : (plan?.product?.id ?? null),
      planName,
      expiresAt: expiryDate,
      metaPurchaseEventId: subscription.metadata?.metaPurchaseEventId || null,
    });
    return;
  }

  if (
    status === "active" &&
    cancelAtPeriodEnd &&
    eventType === "customer.subscription.updated"
  ) {
    if (existingProductSub?.status === "canceling") {
      await upsertProductSubscription(user.id, productKey, {
        status: "canceling",
        billingPeriod,
        expiresAt: expiryDate,
      });
      return;
    }

    await upsertProductSubscription(user.id, productKey, {
      status: "canceling",
      billingPeriod,
      expiresAt: expiryDate,
    });

    if (isPlanChange || isProductSwitch) {
      return;
    }
    
    try {
      await sendSubscriptionChangeEmail({
        email: user.email,
        name: user.name || user.email.split("@")[0],
        planName: planName || "Unlimited",
        status: "canceling",
        expiryDate: expiryDateString,
        dashboardUrl: `${getAppUrl()}/dashboard`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[Stripe] Error sending cancellation scheduled email:", {
        userId: user.id,
        email: user.email,
        error: errorMessage,
      });
    }
    return;
  }

  if (status === "active" || status === "trialing") {
    const isExistingActiveSub = existingProductSub &&
      (existingProductSub.status === "active" || existingProductSub.status === "trialing");
    const tierChanged = isExistingActiveSub && existingProductSub.tier !== tier;
    const billingChanged = isExistingActiveSub &&
      existingProductSub.billingPeriod !== null &&
      existingProductSub.billingPeriod !== billingPeriod;
    const isDetectedPlanChange = tierChanged || billingChanged;

    await upsertProductSubscription(user.id, productKey, {
      tier,
      status,
      billingPeriod,
      stripeSubscriptionId: subscriptionId,
      stripeProductId:
        typeof plan?.product === "string"
          ? plan?.product
          : (plan?.product?.id ?? null),
      planName,
      expiresAt: expiryDate,
      metaPurchaseEventId: subscription.metadata?.metaPurchaseEventId || null,
    });

    if (!options?.skipEmail) {
      if (isPlanChange) {
        try {
          await stripe.subscriptions.update(subscriptionId, {
            metadata: { ...subscription.metadata, isPlanChange: "" },
          });
        } catch {}
        return;
      }

      const emailStatus = isDetectedPlanChange ? "plan_changed" : status;

      try {
        await sendSubscriptionChangeEmail({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          planName: planName || "Free",
          status: emailStatus,
          expiryDate: expiryDateString,
          dashboardUrl: `${getAppUrl()}/dashboard`,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("[Stripe] Error sending subscription change email:", {
          userId: user.id,
          email: user.email,
          status: emailStatus,
          error: errorMessage,
        });
      }
    }
  } else if (status === "incomplete") {
    await upsertProductSubscription(user.id, productKey, {
      tier,
      status: "incomplete",
      billingPeriod,
      stripeSubscriptionId: subscriptionId,
      stripeProductId:
        typeof plan?.product === "string"
          ? plan?.product
          : (plan?.product?.id ?? null),
      planName,
      expiresAt: expiryDate,
      metaPurchaseEventId: subscription.metadata?.metaPurchaseEventId || null,
    });
    return;
  } else if (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  ) {
    const alreadyCanceled = existingProductSub?.status === "canceled" && 
                            existingProductSub?.expiresAt && 
                            existingProductSub.expiresAt <= new Date();
    
    if (alreadyCanceled) {
      return;
    }
    
    if (existingProductSub) {
      const preservedBillingPeriod = (existingProductSub.billingPeriod || billingPeriod) as "monthly" | "annual" | null;

      const now = new Date();
      let finalExpiresAt: Date;

      if (expiryDate && expiryDate > now) {
        finalExpiresAt = expiryDate;
      } else {
        finalExpiresAt = now;
      }

      await upsertProductSubscription(user.id, existingProductSub.productKey as ProductKey, {
        status,
        billingPeriod: preservedBillingPeriod,
        expiresAt: finalExpiresAt,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: existingProductSub.stripeProductId,
      });
    }

    if (isPlanChange || isProductSwitch) {
      return;
    }

    if (options?.skipEmail) {
      return;
    }

    try {
      await sendSubscriptionChangeEmail({
        email: user.email,
        name: user.name || user.email.split("@")[0],
        planName: planName || "Unlimited",
        status,
        dashboardUrl: `${getAppUrl()}/dashboard`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[Stripe] Error sending subscription change email:", {
        userId: user.id,
        email: user.email,
        status,
        error: errorMessage,
      });
    }
  }
}


export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return {
    prices: prices.data.map((price) => ({
      id: price.id,
      active: price.active,
      productId:
        typeof price.product === "string" ? price.product : price.product.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      trialPeriodDays: price.recurring?.trial_period_days,
    })),
  };
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}

export function isTestMode(): boolean {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  return !!apiKey && apiKey.startsWith("sk_test_");
}
