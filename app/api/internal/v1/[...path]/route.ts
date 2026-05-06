import { ProductKey } from "@/lib/db/schema";
import { verifyInternalApiKey } from "@/lib/internal-api/auth";
import {
  assignFreeSubscription,
  revokeSubscription,
} from "@/lib/subscriptions/assign-free-service";
import { NextRequest, NextResponse } from "next/server";

type Handler = (req: NextRequest) => Promise<NextResponse>;

const routes: Record<string, Handler> = {
  "POST subscriptions/assign": assignSubscriptionHandler,
  "POST subscriptions/revoke": revokeSubscriptionHandler,
};

async function dispatch(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const auth = await verifyInternalApiKey(req.headers.get("x-internal-api-key"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { path } = await context.params;
  const key = `${req.method} ${(path || []).join("/")}`;
  const handler = routes[key];

  if (!handler) {
    return NextResponse.json(
      { error: `Unknown route: ${key}` },
      { status: 404 }
    );
  }

  try {
    return await handler(req);
  } catch (error) {
    console.error(`[internal-api] ${key} threw:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = dispatch;
export const GET = dispatch;

async function assignSubscriptionHandler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, productKey, plan, duration, accountLimit } = body as {
    email?: string;
    productKey?: string;
    plan?: string;
    duration?: number;
    accountLimit?: number | null;
  };

  if (plan !== "pro" && plan !== "unlimited") {
    return NextResponse.json(
      { error: "Plan must be 'pro' or 'unlimited'" },
      { status: 400 }
    );
  }

  const result = await assignFreeSubscription({
    email: email || "",
    productKey: (productKey || "") as ProductKey,
    plan,
    duration: duration || 0,
    accountLimit,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    created: result.created,
    stripeCanceled: result.stripeCanceled,
    emailSent: result.emailSent,
    message: result.message,
  });
}

async function revokeSubscriptionHandler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, productKey } = body as {
    email?: string;
    productKey?: string;
  };

  const result = await revokeSubscription({
    email: email || "",
    productKey: (productKey || "") as ProductKey,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    stripeCanceled: result.stripeCanceled,
    emailSent: result.emailSent,
    message: result.message,
  });
}
