import { auth } from "@/lib/auth/config";
import { getUserById, getUserEntitlements, isActiveSubscription, getSubscriptionTier } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          valid: false,
          error: "No valid session found",
        },
        { status: 401 }
      );
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const entitlements = await getUserEntitlements(user.id);

    const userInfo = {
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
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
      valid: true,
      user: userInfo,
      sessionExpiry: session.expires,
    });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: "Token validation failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: "Token is required",
        },
        { status: 400 }
      );
    }

    return await GET();
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: "Invalid request format",
      },
      { status: 400 }
    );
  }
}
