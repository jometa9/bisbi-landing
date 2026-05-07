import { auth } from "@/lib/auth/config";
import { getUserById } from "@/lib/db/queries";
import { ProductKey } from "@/lib/db/schema";
import { isEmailLang } from "@/lib/email/translations";
import {
  assignFreeSubscription,
  revokeSubscription,
} from "@/lib/subscriptions/assign-free-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getUserById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { email, productKey, plan, duration, lang } = data;
    const emailLang = isEmailLang(lang) ? lang : undefined;

    if (plan === "none") {
      const result = await revokeSubscription({
        email,
        productKey: productKey as ProductKey,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        stripeCanceled: result.stripeCanceled,
        emailSent: result.emailSent,
      });
    }

    const result = await assignFreeSubscription({
      email,
      productKey: productKey as ProductKey,
      plan,
      duration,
      lang: emailLang,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      stripeCanceled: result.stripeCanceled,
      emailSent: result.emailSent,
    });
  } catch (error) {
    console.error("[assign-free-subscription]", error);
    return NextResponse.json(
      { error: "Failed to assign free subscription" },
      { status: 500 }
    );
  }
}
