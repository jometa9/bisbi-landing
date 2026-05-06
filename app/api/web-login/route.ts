import { auth } from "@/lib/auth/config";
import { getUserById, getUserEntitlements, isActiveSubscription, getSubscriptionTier } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "iptrade://login";

  const loginUrl = new URL("/sign-in", request.nextUrl.origin);
  loginUrl.searchParams.set("redirect", redirectUrl);
  loginUrl.searchParams.set("source", "app");

  return NextResponse.json({
    success: true,
    loginUrl: loginUrl.toString(),
    message: "Redirect to this URL to start web authentication",
  });
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const entitlements = await getUserEntitlements(user.id);

    const userInfo = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      apiKey: user.apiKey,
      avatar: null,
      entitlements: {
        multi: {
          active: user.role === "admin" || isActiveSubscription(entitlements.multi),
          tier: user.role === "admin" ? "unlimited" : getSubscriptionTier(entitlements.multi),
          status: entitlements.multi?.status || "none",
          expiresAt: entitlements.multi?.expiresAt?.toISOString() || null,
        },
      },
    };

    return NextResponse.json({
      success: true,
      user: userInfo,
      message: "User authenticated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
