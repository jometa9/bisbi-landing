import {
  getUserByApiKey,
  getUserProductSubscription,
  isActiveSubscription,
  getSubscriptionTier,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRICING = {
  pro: {
    monthly: {
      priceId: process.env.STRIPE_BISBI_PRO_MONTHLY_PRICE_ID ?? null,
      amount: 1000,
      currency: "usd",
      label: "US$ 10 / month",
    },
    annual: {
      priceId: process.env.STRIPE_BISBI_PRO_ANNUAL_PRICE_ID ?? null,
      amount: 9600,
      currency: "usd",
      label: "US$ 96 / year",
      monthlyEquivalent: "US$ 8 / month",
      savings: "20% off",
    },
  },
};

// Called by the Bisbi desktop app with Authorization: Bearer {apiKey}
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const sub = await getUserProductSubscription(foundUser.id, "bisbi");
  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);

  return NextResponse.json({
    userId: foundUser.id,
    email: foundUser.email,
    name: foundUser.name ?? foundUser.email.split("@")[0],
    avatar: foundUser.image || null,
    plan: active ? tier : "free",
    subscription: sub
      ? {
          status: sub.status,
          tier: sub.tier,
          billingPeriod: sub.billingPeriod,
          expiresAt: sub.expiresAt?.toISOString() ?? null,
        }
      : null,
    pricing: PRICING,
  });
}
