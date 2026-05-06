"use server";

import { redirect } from "next/navigation";
import { getCurrentUserFromSession, getUserProductSubscription, isActiveSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/payments/stripe";
import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function startCheckout() {
  "use server";
  const currentUser = await getCurrentUserFromSession();
  if (!currentUser) redirect("/sign-in");

  const sub = await getUserProductSubscription(currentUser.id, "bisbi");
  if (sub && isActiveSubscription(sub)) redirect("/dashboard/billing");

  let customerId = currentUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: currentUser.email,
      name: currentUser.name ?? undefined,
      metadata: { userId: currentUser.id },
    });
    customerId = customer.id;
    await db
      .update(user)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(user.id, currentUser.id));
  }

  const baseUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_BISBI_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: currentUser.id, productKey: "bisbi" },
    },
    metadata: { userId: currentUser.id, productKey: "bisbi" },
    success_url: `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/upgrade`,
  });

  redirect(session.url!);
}

export default async function UpgradePage() {
  const currentUser = await getCurrentUserFromSession();
  if (!currentUser) redirect("/sign-in");

  const sub = await getUserProductSubscription(currentUser.id, "bisbi");
  if (sub && isActiveSubscription(sub)) redirect("/dashboard/billing");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl p-8 flex flex-col gap-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9E8E5" }}
        >
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-1" style={{ color: "#1A1A18" }}>
              Bisbi Pro
            </h1>
            <p className="text-sm" style={{ color: "#5C5C57" }}>
              Unlimited voice dictation
            </p>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-bold" style={{ color: "#1A1A18" }}>
              Pro
            </span>
            <p className="text-sm mt-2" style={{ color: "#7BA89C" }}>
              7-day free trial, then billed monthly
            </p>
          </div>

          <ul className="space-y-2 text-sm" style={{ color: "#5C5C57" }}>
            {[
              "Unlimited transcriptions",
              "All languages",
              "Fast & accurate",
              "Works everywhere you type",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2">
                <span style={{ color: "#7BA89C" }}>✓</span> {feat}
              </li>
            ))}
          </ul>

          <form action={startCheckout}>
            <button
              type="submit"
              className="w-full rounded-full py-3 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#7BA89C" }}
            >
              Start free trial
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: "#A8A8A2" }}>
            No charge during trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
