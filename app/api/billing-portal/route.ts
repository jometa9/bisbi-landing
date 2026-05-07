import { getAppUrl } from "@/lib/app-url";
import { getUserByApiKey } from "@/lib/db/queries";
import { getStripe } from "@/lib/payments/stripe";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "billing-portal",
    windowMs: 60_000,
    max: 5,
  });
  if (!rl.ok) return rateLimitResponse(rl);

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

  if (!foundUser.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer for this user" },
      { status: 409 }
    );
  }

  const stripe = await getStripe();
  const baseUrl = getAppUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: foundUser.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ portalUrl: session.url });
}
