import { hashPassword } from "@/lib/auth/session";
import { createNewUserWithOnboarding } from "@/lib/auth/user-onboarding";
import { db } from "@/lib/db/drizzle";
import {
  deleteProductSubscription,
  getUserProductSubscription,
  upsertProductSubscription,
} from "@/lib/db/queries";
import {
  sendSubscriptionChangeEmail,
  sendWelcomeWithSubscriptionEmail,
} from "@/lib/email/services";
import { ProductKey, user } from "@/lib/db/schema";
import { getStripe } from "@/lib/payments/stripe";
import { generateRandomPassword } from "@/lib/utils";
import { eq } from "drizzle-orm";

export type AssignFreeSubscriptionPlan = "pro";

export type AssignFreeSubscriptionResult =
  | {
      ok: true;
      created: boolean;
      stripeCanceled: boolean;
      emailSent: boolean;
      message: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export interface AssignFreeSubscriptionInput {
  email: string;
  productKey: ProductKey;
  plan: AssignFreeSubscriptionPlan;
  duration: number;
}

export async function assignFreeSubscription(
  input: AssignFreeSubscriptionInput
): Promise<AssignFreeSubscriptionResult> {
  const { email, productKey, plan, duration } = input;

  if (!email || !productKey || !duration || !plan) {
    return {
      ok: false,
      status: 400,
      error: "Missing required fields (email, productKey, plan, duration)",
    };
  }

  if (productKey !== "bisbi") {
    return { ok: false, status: 400, error: "Invalid productKey. Must be 'bisbi'" };
  }

  if (plan !== "pro") {
    return {
      ok: false,
      status: 400,
      error: "Plan must be 'pro' for assign",
    };
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  let foundUser = existing[0];
  let created = false;
  let generatedPassword: string | null = null;

  if (!foundUser) {
    generatedPassword = generateRandomPassword(16);
    const passwordHash = await hashPassword(generatedPassword);

    const onboarded = await createNewUserWithOnboarding({
      email,
      passwordHash,
      source: "internal_api",
      skipWelcomeEmail: true,
    });

    if (!onboarded.success || !onboarded.user) {
      return {
        ok: false,
        status: 500,
        error: onboarded.error || "Failed to create user",
      };
    }

    foundUser = onboarded.user;
    created = true;
  }

  const existingSubscription = await getUserProductSubscription(
    foundUser.id,
    productKey
  );

  let stripeCanceled = false;
  if (existingSubscription?.stripeSubscriptionId) {
    try {
      const stripe = await getStripe();
      await stripe.subscriptions.cancel(existingSubscription.stripeSubscriptionId);
      stripeCanceled = true;
    } catch (stripeError: unknown) {
      const msg =
        stripeError instanceof Error ? stripeError.message : String(stripeError);
      if (!msg.includes("No such subscription")) {
        console.error("[assignFreeSubscription] Stripe cancel failed:", msg);
      }
    }
  }

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + duration);
  const expiryDateString = expiryDate.toISOString().split("T")[0];

  const planName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} (Admin Assigned)`;

  await upsertProductSubscription(foundUser.id, productKey, {
    tier: plan,
    status: "admin_assigned",
    stripeSubscriptionId: null,
    stripeProductId: null,
    planName,
    expiresAt: expiryDate,
  });

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const recipientName = foundUser.name || email.split("@")[0];
  const formattedExpiry = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let emailSent = false;
  try {
    if (created && generatedPassword) {
      await sendWelcomeWithSubscriptionEmail({
        email,
        name: recipientName,
        password: generatedPassword,
        planName: `${planLabel} (Free, Admin Assigned)`,
        expiryDate: formattedExpiry,
      });
    } else {
      await sendSubscriptionChangeEmail({
        email,
        name: recipientName,
        planName: `${planLabel} (Free, Admin Assigned)`,
        status: "active",
        expiryDate: formattedExpiry,
      });
    }
    emailSent = true;
  } catch (emailError) {
    console.error("[assignFreeSubscription] Email send failed:", emailError);
  }

  const action = created ? "created and assigned" : "assigned";
  const message = `${planLabel} subscription ${action} to ${email} for ${duration} month(s) (until ${formattedExpiry}).${stripeCanceled ? " Previous Stripe subscription was canceled." : ""}${emailSent ? " Notification email sent." : " Email could not be sent."}`;

  return {
    ok: true,
    created,
    stripeCanceled,
    emailSent,
    message,
  };
}

export type RevokeSubscriptionResult =
  | {
      ok: true;
      stripeCanceled: boolean;
      emailSent: boolean;
      message: string;
    }
  | { ok: false; status: number; error: string };

export interface RevokeSubscriptionInput {
  email: string;
  productKey: ProductKey;
}

export async function revokeSubscription(
  input: RevokeSubscriptionInput
): Promise<RevokeSubscriptionResult> {
  const { email, productKey } = input;

  if (!email || !productKey) {
    return {
      ok: false,
      status: 400,
      error: "Missing required fields (email, productKey)",
    };
  }

  if (productKey !== "bisbi") {
    return { ok: false, status: 400, error: "Invalid productKey. Must be 'bisbi'" };
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length === 0) {
    return { ok: false, status: 404, error: "User not found" };
  }

  const foundUser = existing[0];

  const existingSubscription = await getUserProductSubscription(
    foundUser.id,
    productKey
  );

  let stripeCanceled = false;
  if (existingSubscription?.stripeSubscriptionId) {
    try {
      const stripe = await getStripe();
      await stripe.subscriptions.cancel(existingSubscription.stripeSubscriptionId);
      stripeCanceled = true;
    } catch (stripeError: unknown) {
      const msg =
        stripeError instanceof Error ? stripeError.message : String(stripeError);
      if (!msg.includes("No such subscription")) {
        console.error("[revokeSubscription] Stripe cancel failed:", msg);
      }
    }
  }

  await deleteProductSubscription(foundUser.id, productKey);

  const emailSent = false;

  return {
    ok: true,
    stripeCanceled,
    emailSent,
    message: `Subscription removed from ${email}.${stripeCanceled ? " Previous Stripe subscription was canceled." : ""}`,
  };
}
