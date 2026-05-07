import {
  currentMonthKey,
  getAppSettings,
  getBisbiFreeMonthlyWordLimit,
  getSubscriptionTier,
  getUserByApiKey,
  getUserMonthlyUsage,
  getUserProductSubscription,
  isActiveSubscription,
} from "@/lib/db/queries";
import { reconcileUserFromStripe } from "@/lib/subscriptions/on-demand-reconcile";
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

  await reconcileUserFromStripe(foundUser.id, foundUser.stripeCustomerId);

  const monthKey = currentMonthKey();
  const [sub, usage] = await Promise.all([
    getUserProductSubscription(foundUser.id, "bisbi"),
    getUserMonthlyUsage(foundUser.id, "bisbi", monthKey),
  ]);
  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const effectivePlan = active ? tier : "free";

  const monthlyAmount = settings.bisbiProMonthlyAmount ?? 1000;
  const annualAmount = settings.bisbiProAnnualAmount ?? 9600;
  const monthlyEquivalent = Math.round(annualAmount / 12);
  const savingsPct = Math.round((1 - monthlyEquivalent / monthlyAmount) * 100);

  const wordsUsed = usage?.wordsUsed ?? 0;
  const wordsLimit = getBisbiFreeMonthlyWordLimit(settings);
  const isFree = effectivePlan === "free";

  return NextResponse.json({
    userId: foundUser.id,
    email: foundUser.email,
    name: foundUser.name ?? foundUser.email.split("@")[0],
    avatar: foundUser.image || null,
    plan: effectivePlan,
    subscription: sub
      ? {
          status: sub.status,
          tier: sub.tier,
          billingPeriod: sub.billingPeriod,
          expiresAt: sub.expiresAt?.toISOString() ?? null,
        }
      : null,
    usage: {
      monthKey,
      wordsUsed,
      audioSeconds: usage?.audioSeconds ?? 0,
      transcriptionsCount: usage?.transcriptionsCount ?? 0,
      wordsLimit: isFree ? wordsLimit : null,
      exceeded: isFree && wordsUsed >= wordsLimit,
      remaining: isFree ? Math.max(0, wordsLimit - wordsUsed) : null,
    },
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
