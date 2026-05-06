import { NextResponse } from "next/server";

export async function GET() {
  try {
    const prices = {
      multi: {
        proMonthly: process.env.STRIPE_MULTI_PRO_MONTHLY_PRICE_ID ?? null,
        proAnnual: process.env.STRIPE_MULTI_PRO_ANNUAL_PRICE_ID ?? null,
        unlimitedMonthly: process.env.STRIPE_MULTI_UNLIMITED_MONTHLY_PRICE_ID ?? null,
        unlimitedAnnual: process.env.STRIPE_MULTI_UNLIMITED_ANNUAL_PRICE_ID ?? null,
      },
    };

    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get Stripe prices" },
      { status: 500 }
    );
  }
}
