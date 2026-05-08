import { verifyToken } from "@/lib/auth/session";
import { generateInternalApiKey, generateResetToken, getResetTokenExpiry } from "@/lib/utils";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { auth } from "../auth/config";
import { db } from "./drizzle";
import {
  appSettings,
  ProductKey,
  seenBatch,
  user,
  userMonthlyUsage,
  UserMonthlyUsage,
  userProductSubscription,
  UserProductSubscription,
} from "./schema";

export const BISBI_FREE_MONTHLY_WORD_LIMIT_DEFAULT = 2000;

export function currentMonthKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getBisbiFreeMonthlyWordLimit(
  settings: typeof appSettings.$inferSelect
): number {
  const v = settings.bisbiFreeMonthlyWordLimit;
  if (typeof v === "number" && v > 0) return v;
  return BISBI_FREE_MONTHLY_WORD_LIMIT_DEFAULT;
}

export async function getUserMonthlyUsage(
  userId: string,
  productKey: ProductKey,
  monthKey: string = currentMonthKey()
): Promise<UserMonthlyUsage | null> {
  const result = await db
    .select()
    .from(userMonthlyUsage)
    .where(
      and(
        eq(userMonthlyUsage.userId, userId),
        eq(userMonthlyUsage.productKey, productKey),
        eq(userMonthlyUsage.monthKey, monthKey)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function addUserMonthlyUsage(
  userId: string,
  productKey: ProductKey,
  delta: {
    words: number;
    audioSeconds: number;
    transcriptionsCount?: number;
  }
): Promise<UserMonthlyUsage> {
  const monthKey = currentMonthKey();
  const words = Math.max(0, Math.floor(delta.words || 0));
  const audioSeconds = Math.max(0, Math.floor(delta.audioSeconds || 0));
  const rawCount = Number(delta.transcriptionsCount);
  const transcriptionsCount =
    Number.isFinite(rawCount) && rawCount > 0 ? Math.floor(rawCount) : 1;

  const result = await db
    .insert(userMonthlyUsage)
    .values({
      userId,
      productKey,
      monthKey,
      wordsUsed: words,
      audioSeconds,
      transcriptionsCount,
    })
    .onConflictDoUpdate({
      target: [
        userMonthlyUsage.userId,
        userMonthlyUsage.productKey,
        userMonthlyUsage.monthKey,
      ],
      set: {
        wordsUsed: sql`${userMonthlyUsage.wordsUsed} + ${words}`,
        audioSeconds: sql`${userMonthlyUsage.audioSeconds} + ${audioSeconds}`,
        transcriptionsCount: sql`${userMonthlyUsage.transcriptionsCount} + ${transcriptionsCount}`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

const SEEN_BATCH_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Atomically claims a batchId for the given user/product. Returns true if the
 * batch is new (i.e. should be processed), false if it was seen within the TTL
 * window and the caller should treat the request as a no-op replay.
 */
export async function tryClaimBatch(
  batchId: string,
  userId: string,
  productKey: ProductKey
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SEEN_BATCH_TTL_MS);

  const inserted = await db
    .insert(seenBatch)
    .values({ batchId, userId, productKey, expiresAt })
    .onConflictDoNothing({ target: seenBatch.batchId })
    .returning({ batchId: seenBatch.batchId });

  if (inserted.length > 0) return true;

  // Existing row — reclaim only if it has expired (rotates the window).
  const reclaimed = await db
    .update(seenBatch)
    .set({ expiresAt, userId, productKey })
    .where(
      and(eq(seenBatch.batchId, batchId), sql`${seenBatch.expiresAt} <= ${now}`)
    )
    .returning({ batchId: seenBatch.batchId });

  return reclaimed.length > 0;
}

export async function getUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let customSessionValid = false;

  if (sessionCookie && sessionCookie.value) {
    try {
      const sessionData = await verifyToken(sessionCookie.value);
      if (
        sessionData &&
        sessionData.user &&
        typeof sessionData.user.id === "string"
      ) {
        if (new Date(sessionData.expires) >= new Date()) {
          const userResult = await db
            .select()
            .from(user)
            .where(
              and(eq(user.id, sessionData.user.id), isNull(user.deletedAt))
            )
            .limit(1);

          if (userResult.length > 0) {
            customSessionValid = true;
            return userResult[0];
          }
        }
      }
    } catch (error) {
      console.error("Error verifying custom session token:", error);
    }
  }

  try {
    const session = await auth();

    if (session?.user?.id) {
      const userResult = await db
        .select()
        .from(user)
        .where(and(eq(user.id, session.user.id), isNull(user.deletedAt)))
        .limit(1);

      if (userResult.length > 0) {
        return userResult[0];
      }
    }
  } catch (error) {
    console.error("Error getting current user from NextAuth session:", error);
  }

  if (sessionCookie && !customSessionValid) {
    try {
      cookieStore.delete("session");
    } catch {
    }
  }

  return null;
}

export async function getUserByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserProductSubscriptions(
  userId: string
): Promise<UserProductSubscription[]> {
  return db
    .select()
    .from(userProductSubscription)
    .where(eq(userProductSubscription.userId, userId));
}

export async function getUserProductSubscription(
  userId: string,
  productKey: ProductKey
): Promise<UserProductSubscription | null> {
  const result = await db
    .select()
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.userId, userId),
        eq(userProductSubscription.productKey, productKey)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getProductSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<UserProductSubscription | null> {
  const result = await db
    .select()
    .from(userProductSubscription)
    .where(
      eq(userProductSubscription.stripeSubscriptionId, stripeSubscriptionId)
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function upsertProductSubscription(
  userId: string,
  productKey: ProductKey,
  data: {
    tier?: string;
    status?: string;
    billingPeriod?: "monthly" | "annual" | null;
    stripeSubscriptionId?: string | null;
    stripeProductId?: string | null;
    planName?: string | null;
    expiresAt?: Date | null;
  }
): Promise<UserProductSubscription> {
  const existing = await getUserProductSubscription(userId, productKey);

  if (existing) {
    const result = await db
      .update(userProductSubscription)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProductSubscription.id, existing.id))
      .returning();
    return result[0];
  } else {
    const result = await db
      .insert(userProductSubscription)
      .values({
        userId,
        productKey,
        tier: data.tier || "free",
        status: data.status || "active",
        billingPeriod: data.billingPeriod ?? null,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeProductId: data.stripeProductId,
        planName: data.planName,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }
}


export async function deleteProductSubscription(
  userId: string,
  productKey: ProductKey
): Promise<void> {
  await db
    .delete(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.userId, userId),
        eq(userProductSubscription.productKey, productKey)
      )
    );
}

export async function getUserEntitlements(userId: string) {
  const subscriptions = await getUserProductSubscriptions(userId);

  const entitlements: {
    bisbi: UserProductSubscription | null;
  } = {
    bisbi: null,
  };

  for (const sub of subscriptions) {
    if (sub.productKey === "bisbi") entitlements.bisbi = sub;
  }

  return entitlements;
}

export function isActiveSubscription(
  sub: UserProductSubscription | null
): boolean {
  if (!sub) return false;

  if (["active", "trialing", "admin_assigned", "canceling"].includes(sub.status)) {
    return true;
  }

  if (sub.status === "canceled" && sub.expiresAt) {
    const now = new Date();
    if (sub.expiresAt > now) {
      return true;
    }
  }

  return false;
}

export function getSubscriptionTier(
  sub: UserProductSubscription | null
): string {
  if (!sub) return "free";

  if (isActiveSubscription(sub)) {
    return sub.tier || "free";
  }

  if (sub.status === "canceled" && sub.expiresAt) {
    const now = new Date();
    if (sub.expiresAt > now) {
      return sub.tier || "free";
    }
  }

  return "free";
}

export async function getUserByApiKey(apiKey: string) {
  const result = await db
    .select()
    .from(user)
    .where(and(eq(user.apiKey, apiKey), isNull(user.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createPasswordResetToken(email: string) {
  const userResult = await db
    .select()
    .from(user)
    .where(and(eq(user.email, email), isNull(user.deletedAt)))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  const foundUser = userResult[0];
  const resetToken = generateResetToken();
  const resetTokenExpiry = getResetTokenExpiry();

  await db
    .update(user)
    .set({
      resetToken,
      resetTokenExpiry,
      updatedAt: new Date(),
    })
    .where(eq(user.id, foundUser.id));

  return {
    user: foundUser,
    resetToken,
  };
}

export async function validateResetToken(token: string) {
  const now = new Date();

  const result = await db
    .select()
    .from(user)
    .where(
      and(
        eq(user.resetToken, token),
        gt(user.resetTokenExpiry!, now),
        isNull(user.deletedAt)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function resetPassword(token: string, newPassword: string) {
  void newPassword;
  const currentUser = await validateResetToken(token);

  if (!currentUser) {
    return null;
  }

  return currentUser;
}

export async function updateUserById(
  userId: string,
  userData: Partial<{
    stripeCustomerId: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
    apiKey: string | null;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
  }>
) {
  try {
    const processedData = Object.fromEntries(
      Object.entries(userData).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    );

    const dataToUpdate = {
      ...processedData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(user)
      .set(dataToUpdate)
      .where(eq(user.id, userId))
      .returning();

    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return result[0];
  } catch (error) {
    throw error;
  }
}

const getUserByIdCached = cache(async (userId: string) => {
  const result = await db
    .select()
    .from(user)
    .where(and(eq(user.id, userId), isNull(user.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
});

export async function getUserById(userId: string) {
  return getUserByIdCached(userId);
}

export const getCurrentUserFromSession = cache(async () => {
  try {
    const currentUser = await getUser();
    if (currentUser) {
      return currentUser;
    }

    try {
      const session = await auth();
      if (!session?.user?.id) {
        return null;
      }
      return getUserByIdCached(session.user.id);
    } catch (error) {
      console.error("Error getting session from auth():", error);
      return null;
    }
    } catch (error) {
      console.error("Error in getCurrentUserFromSession:", error);
    return null;
  }
});

export async function getUserDataForDashboard(userId: string) {
  const [userData, entitlements, settings] = await Promise.all([
    getUserById(userId),
    getUserEntitlements(userId),
    getAppSettings(),
  ]);

  if (!userData) return null;

  const sub = entitlements.bisbi;
  const isExpired =
    sub &&
    ["canceled", "expired"].includes(sub.status) &&
    (!sub.expiresAt || sub.expiresAt <= new Date());
  const rawTier = userData.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const bisbiTier = rawTier;
  const freeMonthlyWordLimit = getBisbiFreeMonthlyWordLimit(settings);

  return {
    userId: userData.id,
    email: userData.email,
    name: userData.name || userData.email.split("@")[0],
    isAdmin: userData.role === "admin",
    entitlements: {
      bisbi: isExpired
        ? null
        : {
            active: userData.role === "admin" || isActiveSubscription(sub),
            tier: bisbiTier,
            originalTier: sub?.tier || "free",
            status: sub?.status || "none",
            expiresAt: sub?.expiresAt?.toISOString() || null,
            freeMonthlyWordLimit,
            billingPeriod: ((): "monthly" | "annual" | null => {
              const p = sub?.billingPeriod;
              return p === "monthly" || p === "annual" ? p : null;
            })(),
          },
    },
  };
}

export async function getAppSettings() {
  const settings = await db
    .select()
    .from(appSettings)
    .orderBy(appSettings.id)
    .limit(1);

  if (settings.length === 0) {
    const defaultSettings = await db
      .insert(appSettings)
      .values({
        internalApiKey: generateInternalApiKey(),
        updatedAt: new Date(),
      })
      .returning();

    return defaultSettings[0];
  }

  if (!settings[0].internalApiKey) {
    const generated = generateInternalApiKey();
    const updated = await db
      .update(appSettings)
      .set({ internalApiKey: generated, updatedAt: new Date() })
      .where(eq(appSettings.id, settings[0].id))
      .returning();
    if (updated.length > 0) {
      return updated[0];
    }
  }

  return settings[0];
}

export async function updateAppSettings(
  userId: string,
  data: Partial<{
    resendApiKey: string | null;
    emailFrom: string | null;
    resendInboundWebhookSecret: string | null;
    discordWebhookUrl: string | null;
    discordDailyReportWebhookUrl: string | null;
    internalApiKey: string | null;
    stripeSecretKey: string | null;
    bisbiProMonthlyPriceId: string | null;
    bisbiProAnnualPriceId: string | null;
    bisbiProMonthlyAmount: number | null;
    bisbiProAnnualAmount: number | null;
    bisbiFreeMonthlyWordLimit: number | null;
    bisbiAppVersion: string | null;
    bisbiMacDownloadUrl: string | null;
    bisbiWindowsDownloadUrl: string | null;
    bisbiLinuxDownloadUrl: string | null;
  }>
) {
  const settings = await db
    .select()
    .from(appSettings)
    .orderBy(appSettings.id)
    .limit(1);

  try {
    if (settings.length === 0) {
      const result = await db
        .insert(appSettings)
        .values({
          resendApiKey: data.resendApiKey ?? null,
          emailFrom: data.emailFrom ?? null,
          resendInboundWebhookSecret: data.resendInboundWebhookSecret ?? null,
          discordDailyReportWebhookUrl: data.discordDailyReportWebhookUrl ?? null,
          internalApiKey: data.internalApiKey ?? generateInternalApiKey(),
          bisbiAppVersion: data.bisbiAppVersion ?? null,
          bisbiMacDownloadUrl: data.bisbiMacDownloadUrl ?? null,
          bisbiWindowsDownloadUrl: data.bisbiWindowsDownloadUrl ?? null,
          bisbiLinuxDownloadUrl: data.bisbiLinuxDownloadUrl ?? null,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .returning();

      return result[0];
    } else {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
        updatedBy: userId,
      };

      if (data.resendApiKey !== undefined) {
        updateData.resendApiKey = data.resendApiKey ?? null;
      }
      if (data.emailFrom !== undefined) {
        updateData.emailFrom = data.emailFrom ?? null;
      }
      if (data.resendInboundWebhookSecret !== undefined) {
        updateData.resendInboundWebhookSecret = data.resendInboundWebhookSecret ?? null;
      }
      if (data.discordWebhookUrl !== undefined) {
        updateData.discordWebhookUrl = data.discordWebhookUrl ?? null;
      }
      if (data.discordDailyReportWebhookUrl !== undefined) {
        updateData.discordDailyReportWebhookUrl =
          data.discordDailyReportWebhookUrl ?? null;
      }
      if (data.bisbiMacDownloadUrl !== undefined) {
        updateData.bisbiMacDownloadUrl =
          data.bisbiMacDownloadUrl?.trim() || null;
      }
      if (data.internalApiKey !== undefined) {
        updateData.internalApiKey = data.internalApiKey?.trim() || null;
      }
      if (data.stripeSecretKey !== undefined) {
        updateData.stripeSecretKey = data.stripeSecretKey?.trim() || null;
      }
      if (data.bisbiProMonthlyPriceId !== undefined) {
        updateData.bisbiProMonthlyPriceId = data.bisbiProMonthlyPriceId?.trim() || null;
      }
      if (data.bisbiProAnnualPriceId !== undefined) {
        updateData.bisbiProAnnualPriceId = data.bisbiProAnnualPriceId?.trim() || null;
      }
      if (data.bisbiProMonthlyAmount !== undefined) {
        updateData.bisbiProMonthlyAmount = data.bisbiProMonthlyAmount ?? null;
      }
      if (data.bisbiProAnnualAmount !== undefined) {
        updateData.bisbiProAnnualAmount = data.bisbiProAnnualAmount ?? null;
      }
      if (data.bisbiFreeMonthlyWordLimit !== undefined) {
        updateData.bisbiFreeMonthlyWordLimit =
          data.bisbiFreeMonthlyWordLimit ?? null;
      }
      if (data.bisbiAppVersion !== undefined) {
        updateData.bisbiAppVersion = data.bisbiAppVersion?.trim() || null;
      }
      if (data.bisbiWindowsDownloadUrl !== undefined) {
        updateData.bisbiWindowsDownloadUrl =
          data.bisbiWindowsDownloadUrl?.trim() || null;
      }
      if (data.bisbiLinuxDownloadUrl !== undefined) {
        updateData.bisbiLinuxDownloadUrl =
          data.bisbiLinuxDownloadUrl?.trim() || null;
      }

      const result = await db
        .update(appSettings)
        .set(updateData)
        .where(eq(appSettings.id, settings[0].id))
        .returning();

      if (result.length > 0) {
        return result[0];
      } else {
        const currentSettings = await db
          .select()
          .from(appSettings)
          .where(eq(appSettings.id, settings[0].id))
          .limit(1);

        return currentSettings[0];
      }
    }
  } catch (error) {
    throw error;
  }
}

