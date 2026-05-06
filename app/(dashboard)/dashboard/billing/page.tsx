"use server";

import { redirect } from "next/navigation";
import {
  getCurrentUserFromSession,
  getUserProductSubscription,
  upsertProductSubscription,
  isActiveSubscription,
} from "@/lib/db/queries";
import { stripe } from "@/lib/payments/stripe";
import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import Link from "next/link";

// ─── server action: open Stripe Customer Portal ──────────────────────────────
async function openPortal() {
  "use server";
  const currentUser = await getCurrentUserFromSession();
  if (!currentUser?.stripeCustomerId) redirect("/dashboard/upgrade");

  const baseUrl = getAppUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: currentUser.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`,
  });
  redirect(session.url);
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts: number | null | undefined) {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type StatusInfo = {
  label: string;
  description: string;
  color: string;
};

function statusInfo(status: string, expiresAt: Date | null): StatusInfo {
  const expLabel = expiresAt
    ? expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  switch (status) {
    case "trialing":
      return {
        label: "Free Trial",
        description: expLabel ? `Trial ends ${expLabel}` : "Trial active",
        color: "#7BA89C",
      };
    case "active":
      return {
        label: "Pro",
        description: expLabel ? `Renews ${expLabel}` : "Active",
        color: "#7BA89C",
      };
    case "canceling":
      return {
        label: "Pro (Canceling)",
        description: expLabel ? `Access until ${expLabel}` : "Canceling at period end",
        color: "#E8A87C",
      };
    case "past_due":
      return {
        label: "Past Due",
        description: "Payment failed. Update your payment method.",
        color: "#E87C7C",
      };
    default:
      return {
        label: "Inactive",
        description: "No active subscription",
        color: "#A8A8A2",
      };
  }
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const currentUser = await getCurrentUserFromSession();
  if (!currentUser) redirect("/sign-in");

  const params = await searchParams;

  // If returning from Stripe Checkout, sync subscription from session.
  if (params.session_id) {
    await syncFromCheckoutSession(params.session_id, currentUser.id);
  }

  // Sync with Stripe if user has an existing subscription.
  let sub = await getUserProductSubscription(currentUser.id, "bisbi");
  if (sub?.stripeSubscriptionId) {
    sub = await syncFromStripe(sub.stripeSubscriptionId, currentUser.id);
  }

  const isActive = sub ? isActiveSubscription(sub) : false;

  if (!isActive) {
    redirect("/dashboard/upgrade");
  }

  const info = statusInfo(sub!.status, sub!.expiresAt ?? null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl p-8 flex flex-col gap-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9E8E5" }}
        >
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: "#1A1A18" }}>
              Subscription
            </h1>
            <p className="text-sm" style={{ color: "#5C5C57" }}>
              Manage your Bisbi Pro plan
            </p>
          </div>

          <div
            className="rounded-xl p-4 flex items-start justify-between gap-4"
            style={{ backgroundColor: "#F0EDE6" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "#1A1A18" }}>
                {info.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#5C5C57" }}>
                {info.description}
              </p>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: info.color, color: "#FFFFFF" }}
            >
              {sub!.status === "trialing" ? "Trial" : "Active"}
            </span>
          </div>

          {currentUser.stripeCustomerId && (
            <form action={openPortal}>
              <button
                type="submit"
                className="w-full rounded-full py-3 text-sm font-medium transition-colors"
                style={{ backgroundColor: "#E6EFED", color: "#1A1A18" }}
              >
                Manage subscription
              </button>
            </form>
          )}

          <p className="text-center text-xs" style={{ color: "#A8A8A2" }}>
            Cancel, update payment, or change plan via Stripe.
          </p>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "#A8A8A2" }}>
          <Link href="/dashboard" style={{ color: "#7BA89C" }}>
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Stripe sync helpers ──────────────────────────────────────────────────────

async function syncFromCheckoutSession(sessionId: string, userId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session.subscription) return;

    const stripeSub =
      typeof session.subscription === "string"
        ? await stripe.subscriptions.retrieve(session.subscription)
        : (session.subscription as Stripe.Subscription);

    if (session.customer) {
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer.id;
      await db
        .update(user)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(user.id, userId));
    }

    await upsertFromStripeSub(userId, stripeSub);
  } catch {
    // Session may already be consumed; not critical.
  }
}

async function syncFromStripe(stripeSubId: string, userId: string) {
  try {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    return await upsertFromStripeSub(userId, stripeSub);
  } catch {
    return getUserProductSubscription(userId, "bisbi");
  }
}

async function upsertFromStripeSub(userId: string, stripeSub: Stripe.Subscription) {
  const status = mapStripeStatus(stripeSub);
  const expiresAt = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;
  const billingPeriod =
    stripeSub.items.data[0]?.price?.recurring?.interval === "year"
      ? "annual"
      : "monthly";

  return upsertProductSubscription(userId, "bisbi", {
    tier: "pro",
    status,
    billingPeriod,
    stripeSubscriptionId: stripeSub.id,
    stripeProductId:
      typeof stripeSub.items.data[0]?.price.product === "string"
        ? stripeSub.items.data[0].price.product
        : null,
    planName: "Bisbi Pro",
    expiresAt,
  });
}

function mapStripeStatus(sub: Stripe.Subscription) {
  if (sub.status === "trialing") return "trialing";
  if (sub.status === "canceled") return "canceled";
  if (sub.status === "past_due") return "past_due";
  if (sub.status === "active" && sub.cancel_at_period_end) return "canceling";
  return "active";
}
