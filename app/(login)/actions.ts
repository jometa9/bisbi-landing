"use server";

import { auth } from "@/lib/auth/config";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { createNewUserWithOnboarding } from "@/lib/auth/user-onboarding";
import { db } from "@/lib/db/drizzle";
import { createPasswordResetToken, validateResetToken } from "@/lib/db/queries";
import { user as users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function logoutAction() {
  const cookieStore = await cookies();

  const cookiesToDelete = [
    "session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
  ];

  for (const cookieName of cookiesToDelete) {
    cookieStore.delete(cookieName);
  }

  return { success: true };
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (foundUser.length === 0) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  const foundUserData = foundUser[0];

  if (
    !foundUserData.passwordHash ||
    typeof foundUserData.passwordHash !== "string"
  ) {
    return {
      error:
        'This email was registered with Google. Please sign in with Google, or <a href="/forgot-password" class="underline text-primary">reset your password</a> to enable login with password. After resetting, you can log in with both Google and your new password.',
      email,
      password,
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUserData.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  await setSession(foundUserData);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    try {
      const priceId = formData.get("priceId") as string;
      if (priceId) {
        const session = await createCheckoutSession({
          priceId,
          userId: foundUserData.id,
          email: foundUserData.email,
          customerId: foundUserData.stripeCustomerId,
        });
        if (session?.url) {
          redirect(session.url);
        }
      }
    } catch {
      return {
        error:
          "Error al conectar con el servicio de pagos. Por favor intenta de nuevo más tarde.",
      };
    }
  }

  redirect("/dashboard");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  const passwordHash = await hashPassword(password);

  const result = await createNewUserWithOnboarding({
    email,
    passwordHash,
    source: "signup_form",
    formData,
  });

  if (!result.success || !result.user) {
    return {
      error: result.error || "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  await setSession(result.user);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    try {
      const priceId = formData.get("priceId") as string;
      if (priceId) {
        const session = await createCheckoutSession({
          priceId,
          userId: result.user.id,
          email: result.user.email,
          customerId: result.user.stripeCustomerId,
        });
        if (session?.url) {
          redirect(session.url);
        }
      }
    } catch {
      redirect("/dashboard?error=payment-setup");
    }
  }

  redirect("/dashboard");
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, currentUser) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      currentUser.passwordHash || ""
    );

    if (!isPasswordValid) {
      return { error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return {
        error: "New password must be different from the current password.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, currentUser.id));

    return { success: "Password updated successfully." };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, currentUser) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, currentUser.passwordHash || "");
    if (!isPasswordValid) {
      return { error: "Incorrect password. Account deletion failed." };
    }

    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`,
      })
      .where(eq(users.id, currentUser.id));

    (await cookies()).delete("session");
    redirect("/sign-in");
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, currentUser) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, currentUser.id));

    return { success: "Account updated successfully." };
  }
);

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const forgotPassword = validatedAction(
  forgotPasswordSchema,
  async (data) => {
    const { email } = data;

    const result = await createPasswordResetToken(email);

    if (!result) {
      return {
        success:
          "If an account exists with that email, a password reset link has been sent.",
      };
    }

    try {
      await sendPasswordResetEmail({
        email,
        name: result.user.name || email.split("@")[0],
        token: result.resetToken,
        expiryMinutes: 60,
      });
    } catch {
    }

    return {
      success:
        "If an account exists with that email, a password reset link has been sent.",
    };
  }
);

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordAction = validatedAction(
  resetPasswordSchema,
  async (data) => {
    const { token, password } = data;

    const dbUser = await validateResetToken(token);

    if (!dbUser) {
      return {
        error: "Invalid or expired token. Please request a new password reset.",
      };
    }

    const passwordHash = await hashPassword(password);

    await db
      .update(users)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    const currentSession = await auth();

    if (!currentSession?.user) {
      await setSession(dbUser);
      redirect("/dashboard");
    }

    return {
      success: "Your password has been updated successfully.",
    };
  }
);

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const setPasswordForOAuthUser = validatedActionWithUser(
  setPasswordSchema,
  async (data, _, currentUser) => {
    const { newPassword } = data;

    if (currentUser.passwordHash) {
      return {
        error:
          "You already have a password set. Use 'Change Password' instead.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, currentUser.id));

    return {
      success:
        "Password set successfully. You can now login with email and password.",
    };
  }
);
