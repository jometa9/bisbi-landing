import { getAppUrl } from "@/lib/app-url";
import { 
  getUser, 
  updateUserById, 
  upsertProductSubscription,
  getProductSubscriptionByStripeId,
} from "@/lib/db/queries";
import { ProductKey } from "@/lib/db/schema";
import { sendSubscriptionChangeEmail } from "@/lib/email";
import {
  extractClientInfo,
  extractFacebookCookies,
  generateEventId,
  trackPurchase,
} from "@/lib/meta";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { stripe, handleSubscriptionChange, getStripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getTierFromPlanName(planName: string | null): string {
  if (!planName) return "free";
  const lowerName = planName.toLowerCase();
  if (lowerName.includes("unlimited")) return "unlimited";
  if (lowerName.includes("pro")) return "pro";
  return "free";
}

export async function GET(req: NextRequest) {
  if (!paymentsEnabled) {
    return NextResponse.redirect(new URL("/dashboard", getAppUrl()));
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(
      new URL("/dashboard/pricing?error=missing-session", getAppUrl())
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer", "line_items"],
    });

    if (!session) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=invalid-session", getAppUrl())
      );
    }

    if (!session.customer) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=missing-customer", getAppUrl())
      );
    }

    if (!session.subscription) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=missing-subscription", getAppUrl())
      );
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer.id;

    if (!subscriptionId || !customerId) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=incomplete-data", getAppUrl())
      );
    }

    let subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const item = subscription.items.data[0];
    if (!item || !item.price) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=missing-price-data", getAppUrl())
      );
    }

    let productId =
      typeof item.price.product === "string"
        ? item.price.product
        : item.price.product.id;
    let productName =
      typeof item.price.product === "string"
        ? "Unlimited Subscription"
        : (item.price.product as Stripe.Product).name || "Unlimited Subscription";
    const status = subscription.status;

    const productKey = (session.metadata?.productKey as ProductKey) || "multi";

    const user = await getUser();
    if (!user) {
      return NextResponse.redirect(
        new URL("/sign-in?error=no-session", getAppUrl())
      );
    }

    const eventId = generateEventId();

    let expiryDate: Date | undefined = undefined;
    let expiryDateString: string | undefined = undefined;
    if (subscription.current_period_end) {
      expiryDate = new Date(subscription.current_period_end * 1000);
      expiryDateString = expiryDate.toISOString().split("T")[0];
    }

    try {
      await updateUserById(user.id, {
        stripeCustomerId: customerId,
      });


      const isPlanChange = session.metadata?.isPlanChange === "true" || session.metadata?.changePlan === "true";
      const existingSubscriptionId = session.metadata?.existingSubscriptionId || 
        session.metadata?.previousSubscriptionId ||
        (isPlanChange && subscription.metadata?.existingSubscriptionId);
      const newPriceId = session.metadata?.newPriceId || 
        (isPlanChange ? item.price.id : null);
      
      if (isPlanChange && existingSubscriptionId) {
        try {
          const stripe = getStripe();
          
          const existingSub = await stripe.subscriptions.retrieve(existingSubscriptionId, {
            expand: ["items.data.price.product"],
          });
          const currentItem = existingSub.items.data[0];
          
          if (!currentItem) {
            throw new Error("No items found in existing subscription");
          }
          
          {
            const updatedSubscription = await stripe.subscriptions.update(existingSubscriptionId, {
              items: [
                {
                  id: currentItem.id,
                  price: newPriceId || item.price.id,
                },
              ],
              metadata: {
                ...existingSub.metadata,
                isPlanChange: "true",
                newPlanProductKey: productKey,
              },
              proration_behavior: "create_prorations",
            });

            let creditAmount = 0;
            try {
              const openInvoices = await stripe.invoices.list({
                subscription: updatedSubscription.id,
                status: "open",
                limit: 1,
              });
              
              const draftInvoices = await stripe.invoices.list({
                subscription: updatedSubscription.id,
                status: "draft",
                limit: 1,
              });
              
              const customer = await stripe.customers.retrieve(customerId);
              const customerBalance = typeof customer === "object" && !("deleted" in customer) 
                ? (customer.balance || 0) 
                : 0;
              
              if (openInvoices.data.length > 0) {
                const pendingInvoice = openInvoices.data[0];
                const amountDue = pendingInvoice.amount_due;

                if (amountDue > 0) {
                  const invoicePaymentUrl = pendingInvoice.hosted_invoice_url || 
                    `https://billing.stripe.com/pay/${pendingInvoice.id}`;
                  
                  return NextResponse.redirect(invoicePaymentUrl);
                } else if (amountDue < 0) {
                  creditAmount = Math.abs(amountDue);
                }
              }

              if (draftInvoices.data.length > 0) {
                const draftInvoice = draftInvoices.data[0];
                const draftAmount = draftInvoice.amount_due || 0;
                if (draftAmount < 0) {
                  const draftCredit = Math.abs(draftAmount);
                  creditAmount = Math.max(creditAmount, draftCredit);
                }
              }

              if (customerBalance < 0) {
                const balanceCredit = Math.abs(customerBalance);
                creditAmount = Math.max(creditAmount, balanceCredit);
              }
            } catch (invoiceError) {
              console.error(`[Checkout] Error checking for pending invoices/credits:`, invoiceError);
            }
            
            const updatedSubFull = await stripe.subscriptions.retrieve(updatedSubscription.id, {
              expand: ["items.data.price.product"],
            });
            
            if (!updatedSubFull.metadata?.productKey || updatedSubFull.metadata.productKey !== productKey) {
              await stripe.subscriptions.update(updatedSubscription.id, {
                metadata: {
                  ...updatedSubFull.metadata,
                  productKey: productKey,
                },
              });
              const updatedSubWithMetadata = await stripe.subscriptions.retrieve(updatedSubscription.id, {
                expand: ["items.data.price.product"],
              });
              await handleSubscriptionChange(updatedSubWithMetadata, "customer.subscription.updated", { 
                skipEmail: true
              });
            } else {
              await handleSubscriptionChange(updatedSubFull, "customer.subscription.updated", { 
                skipEmail: true
              });
            }
            
            const updatedItem = updatedSubFull.items.data[0];
            if (updatedItem && updatedItem.price) {
              const updatedProductId =
                typeof updatedItem.price.product === "string"
                  ? updatedItem.price.product
                  : updatedItem.price.product.id;
              const updatedProductName =
                typeof updatedItem.price.product === "string"
                  ? "Unlimited Subscription"
                  : (updatedItem.price.product as Stripe.Product).name || "Unlimited Subscription";
              
              productId = updatedProductId;
              productName = updatedProductName;
            }
          }
        } catch (updateError) {
          console.error(`[Checkout] Error updating existing subscription for plan change:`, updateError);
          await handleSubscriptionChange(subscription, "checkout.session.completed", { 
            skipEmail: isPlanChange 
          });
        }
      } else {
        try {
          const stripe = getStripe();
          if (!subscription.metadata?.productKey || subscription.metadata.productKey !== productKey) {
            await stripe.subscriptions.update(subscriptionId, {
              metadata: {
                ...subscription.metadata,
                productKey: productKey,
              },
              });
            subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ["items.data.price.product"],
            });
          }
        } catch (metadataError) {
          console.error(`[Checkout] Error updating subscription metadata:`, metadataError);
        }

        await handleSubscriptionChange(subscription, "checkout.session.completed", { 
          skipEmail: isPlanChange 
        });
      }
      
      const verifiedSub = await getProductSubscriptionByStripeId(subscriptionId);
      if (!verifiedSub) {
        console.error(`[Checkout] ERROR: Subscription not found after sync for ${productKey} with subscriptionId ${subscriptionId}`);
      }

      try {
        await sendSubscriptionChangeEmail({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          planName: `${productName} (${productKey.toUpperCase()})`,
          status: isPlanChange ? "plan_changed" : status,
          expiryDate: expiryDateString,
        });
      } catch (emailError) {
        console.error("Error sending subscription change email:", emailError);
      }

      try {
        const { fbc, fbp } = extractFacebookCookies(req);
        const { clientIpAddress, clientUserAgent } = extractClientInfo(req);
        await trackPurchase({
          email: user.email,
          firstName: user.name?.split(" ")[0],
          lastName: user.name?.split(" ").slice(1).join(" "),
          value: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
          currency: item.price.currency.toUpperCase(),
          contentName: `${productName} (${productKey.toUpperCase()})`,
          contentIds: [productId],
          numItems: 1,
          productKey,
          eventSourceUrl: new URL("/dashboard", getAppUrl()).toString(),
          eventId,
          clientIpAddress,
          clientUserAgent,
          fbc,
          fbp,
        });
      } catch (metaError) {
        console.error("[Checkout] Meta Conversions API Purchase:", metaError);
      }

    } catch (updateError) {
      console.error("Error updating subscription:", updateError);
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=update-error", getAppUrl())
      );
    }

    const purchaseScript = `
      if (typeof window !== 'undefined' && window.fbq) {
        fbq('track', 'Purchase', {
          content_name: '${productName} (${productKey.toUpperCase()})',
          content_type: 'subscription',
          content_ids: ['${productId}'],
          value: ${item.price.unit_amount ? item.price.unit_amount / 100 : 0},
          currency: '${item.price.currency.toUpperCase()}',
          num_items: 1,
          custom_data: { productKey: '${productKey}' }
        }, '${eventId}');
      }
    `;

    const getDashboardRoute = (productKey: string): string => {
      return "/dashboard";
    };

    const dashboardRoute = getDashboardRoute(productKey);
    const redirectUrl = new URL(dashboardRoute, getAppUrl());
    redirectUrl.searchParams.set("success", "subscription-activated");
    redirectUrl.searchParams.set("product", productKey);
    redirectUrl.searchParams.set(
      "pixel_script",
      encodeURIComponent(purchaseScript)
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Checkout callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/pricing?error=checkout-error", getAppUrl())
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!paymentsEnabled) {
      return NextResponse.json(
        { error: "Payments are temporarily disabled" },
        { status: 403 }
      );
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No user session found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { priceId, productId, productName, productKey = "multi" } = body;

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const simulatedCustomerId = `cus_sim_${Math.random().toString(36).substring(2, 15)}`;
    const simulatedSubscriptionId = `sub_sim_${Math.random().toString(36).substring(2, 15)}`;
    const simulatedProductId =
      productId || `prod_sim_${Math.random().toString(36).substring(2, 15)}`;
    const simulatedProductName = productName || "Unlimited Plan (Simulated)";

    const tier = getTierFromPlanName(simulatedProductName);
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await updateUserById(user.id, {
      stripeCustomerId: simulatedCustomerId,
    });

    await upsertProductSubscription(user.id, productKey as ProductKey, {
      tier,
      status: "active",
      stripeSubscriptionId: simulatedSubscriptionId,
      stripeProductId: simulatedProductId,
      planName: simulatedProductName,
      expiresAt: expiryDate,
    });

    try {
      await sendSubscriptionChangeEmail({
        email: user.email,
        name: user.name || user.email.split("@")[0],
        planName: `${simulatedProductName} (${productKey.toUpperCase()})`,
        status: "active",
        expiryDate: expiryDate.toISOString().split("T")[0],
      });
    } catch (emailError) {
      console.error("Error sending subscription change email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Simulated subscription activated successfully",
      redirectUrl: `/dashboard?success=subscription-activated&product=${productKey}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error in checkout simulation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
