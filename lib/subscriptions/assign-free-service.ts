import { hashPassword } from "@/lib/auth/session";
import { createNewUserWithOnboarding } from "@/lib/auth/user-onboarding";
import { db } from "@/lib/db/drizzle";
import {
  deleteProductSubscription,
  getUserProductSubscription,
  upsertProductSubscription,
} from "@/lib/db/queries";
import { ProductKey, user } from "@/lib/db/schema";
import { stripe } from "@/lib/payments/stripe";
import { generateRandomPassword } from "@/lib/utils";
import { eq } from "drizzle-orm";

export type AssignFreeSubscriptionPlan = "pro" | "unlimited";

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
  accountLimit?: number | null;
}

export async function assignFreeSubscription(
  input: AssignFreeSubscriptionInput
): Promise<AssignFreeSubscriptionResult> {
  const { email, productKey, plan, duration, accountLimit } = input;

  if (!email || !productKey || !duration || !plan) {
    return {
      ok: false,
      status: 400,
      error: "Missing required fields (email, productKey, plan, duration)",
    };
  }

  if (productKey !== "multi") {
    return { ok: false, status: 400, error: "Invalid productKey. Must be 'multi'" };
  }

  if (plan !== "pro" && plan !== "unlimited") {
    return {
      ok: false,
      status: 400,
      error: "Plan must be 'pro' or 'unlimited' for assign",
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

  const upsertData: Parameters<typeof upsertProductSubscription>[2] = {
    tier: plan,
    status: "admin_assigned",
    stripeSubscriptionId: null,
    stripeProductId: null,
    planName,
    expiresAt: expiryDate,
  };
  if (accountLimit !== undefined) {
    upsertData.accountLimit = accountLimit;
  }

  await upsertProductSubscription(foundUser.id, productKey, upsertData);

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  const emailSent = false;

  const action = created ? "created and assigned" : "assigned";
  const message = `${planLabel} subscription ${action} to ${email} for ${duration} month(s).${stripeCanceled ? " Previous Stripe subscription was canceled." : ""}`;

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

  if (productKey !== "multi") {
    return { ok: false, status: 400, error: "Invalid productKey. Must be 'multi'" };
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
