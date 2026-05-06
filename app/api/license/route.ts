import {
  getAppSettings,
  getUserByApiKey,
  getUserProductSubscription,
  isActiveSubscription,
  getSubscriptionTier,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Called by the Bisbi desktop app with Authorization: Bearer {apiKey}
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const [foundUser, settings] = await Promise.all([
    getUserByApiKey(apiKey),
    getAppSettings(),
  ]);

  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const sub = await getUserProductSubscription(foundUser.id, "bisbi");
  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);

  const monthlyAmount = settings.bisbiProMonthlyAmount ?? 1000;
  const annualAmount = settings.bisbiProAnnualAmount ?? 9600;
  const monthlyEquivalent = Math.round(annualAmount / 12);
  const savingsPct = Math.round((1 - monthlyEquivalent / monthlyAmount) * 100);

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
    pricing: {
      pro: {
        monthly: {
          priceId: settings.bisbiProMonthlyPriceId || null,
          amount: monthlyAmount,
          currency: "usd",
          label: `US$ ${(monthlyAmount / 100).toFixed(0)} / month`,
        },
        annual: {
          priceId: settings.bisbiProAnnualPriceId || null,
          amount: annualAmount,
          currency: "usd",
          label: `US$ ${(annualAmount / 100).toFixed(0)} / year`,
          monthlyEquivalent: `US$ ${(monthlyEquivalent / 100).toFixed(0)} / month`,
          savings: `${savingsPct}% off`,
        },
      },
    },
  });
}
