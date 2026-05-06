import {
  getUserByApiKey,
  getUserProductSubscription,
  isActiveSubscription,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Called by the Bisbi desktop app with Authorization: Bearer {apiKey}
// to validate the session and get the current subscription plan.
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

  return NextResponse.json({
    userId: foundUser.id,
    email: foundUser.email,
    name: foundUser.name ?? foundUser.email.split("@")[0],
    plan: active ? "pro" : "free",
    avatarUrl: null,
    subscription: sub
      ? {
          status: sub.status,
          expiresAt: sub.expiresAt?.toISOString() ?? null,
        }
      : null,
  });
}
