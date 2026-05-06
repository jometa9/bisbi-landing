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
  delta: { words: number; audioSeconds: number }
): Promise<UserMonthlyUsage> {
  const monthKey = currentMonthKey();
  const words = Math.max(0, Math.floor(delta.words || 0));
  const audioSeconds = Math.max(0, Math.floor(delta.audioSeconds || 0));

  const result = await db
    .insert(userMonthlyUsage)
    .values({
      userId,
      productKey,
      monthKey,
      wordsUsed: words,
      audioSeconds,
      transcriptionsCount: 1,
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
        transcriptionsCount: sql`${userMonthlyUsage.transcriptionsCount} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
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
    accountLimit?: number | null;
    status?: string;
    billingPeriod?: "monthly" | "annual" | null;
    stripeSubscriptionId?: string | null;
    stripeProductId?: string | null;
    planName?: string | null;
    expiresAt?: Date | null;
    metaPurchaseEventId?: string | null;
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
        accountLimit: data.accountLimit ?? null,
        status: data.status || "active",
        billingPeriod: data.billingPeriod ?? null,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeProductId: data.stripeProductId,
        planName: data.planName,
        expiresAt: data.expiresAt,
        metaPurchaseEventId: data.metaPurchaseEventId,
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
    multi: UserProductSubscription | null;
    bisbi: UserProductSubscription | null;
  } = {
    multi: null,
    bisbi: null,
  };

  for (const sub of subscriptions) {
    if (sub.productKey === "multi") entitlements.multi = sub;
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
    metaPurchaseEventId: string | null;
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

  const subscriptionLimits = getSubscriptionLimits(settings);
  
  const getLimitsForTier = (tier: string) => {
    if (tier === "unlimited") {
      return {
        accountLimit: subscriptionLimits.unlimited?.accountLimit ?? null,
        fixedLotSize: subscriptionLimits.unlimited?.fixedLotSize ?? null,
      };
    }
    if (tier === "pro" || userData.role === "admin") {
      return {
        accountLimit: subscriptionLimits.pro?.accountLimit ?? 8,
        fixedLotSize: subscriptionLimits.pro?.fixedLotSize ?? null,
      };
    }
    return {
      accountLimit: subscriptionLimits.free?.accountLimit ?? 1,
      fixedLotSize: subscriptionLimits.free?.fixedLotSize ?? 0.01,
    };
  };

  const sub = entitlements.multi;
  const isExpired =
    sub &&
    ["canceled", "expired"].includes(sub.status) &&
    (!sub.expiresAt || sub.expiresAt <= new Date());
  const rawTier = userData.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const multiTier = rawTier;

  return {
    userId: userData.id,
    email: userData.email,
    name: userData.name || userData.email.split("@")[0],
    isAdmin: userData.role === "admin",
    entitlements: {
      multi: isExpired
        ? null
        : {
            active: userData.role === "admin" || isActiveSubscription(sub),
            tier: multiTier,
            originalTier: sub?.tier || "free",
            status: sub?.status || "none",
            expiresAt: sub?.expiresAt?.toISOString() || null,
            limits: getLimitsForTier(multiTier),
            billingPeriod: ((): "monthly" | "annual" | null => {
              const p = sub?.billingPeriod;
              return p === "monthly" || p === "annual" ? p : null;
            })(),
          },
    },
    downloads: {
      multi: {
        windows: {
          version: settings.multiVersion,
          downloadUrl: settings.multiWindowsDownloadUrl || null,
        },
        mac: {
          version: settings.multiVersion,
          downloadUrl: settings.multiMacDownloadUrl || null,
        },
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
    const defaultLimits = JSON.stringify({
      free: { accountLimit: 1, fixedLotSize: 0.01 },
      pro: { accountLimit: 8, fixedLotSize: null },
      unlimited: { accountLimit: null, fixedLotSize: null },
    });
    const defaultSettings = await db
      .insert(appSettings)
      .values({
        multiVersion: "1.0.0",
        multiWindowsDownloadUrl: "",
        multiMacDownloadUrl: "",
        localCopierSubscriptionLimits: defaultLimits,
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

export function getSubscriptionLimits(
  settings: typeof appSettings.$inferSelect
) {
  if (!settings.localCopierSubscriptionLimits) {
    return {
      free: { accountLimit: 1, fixedLotSize: 0.01 },
      pro: { accountLimit: 8, fixedLotSize: null },
      unlimited: { accountLimit: null, fixedLotSize: null },
    };
  }

  try {
    return JSON.parse(settings.localCopierSubscriptionLimits);
  } catch {
    return {
      free: { accountLimit: 1, fixedLotSize: 0.01 },
      pro: { accountLimit: 8, fixedLotSize: null },
      unlimited: { accountLimit: null, fixedLotSize: null },
    };
  }
}

export async function getDownloadInfo(
  productKey: ProductKey,
  os: "windows" | "mac"
): Promise<{ version: string; downloadUrl: string | null }> {
  const settings = await getAppSettings();
  if (os === "mac") {
    return {
      version: settings.multiVersion,
      downloadUrl: settings.multiMacDownloadUrl,
    };
  }
  return {
    version: settings.multiVersion,
    downloadUrl: settings.multiWindowsDownloadUrl,
  };
}

export async function updateAppSettings(
  userId: string,
  data: Partial<{
    multiVersion: string;
    multiWindowsDownloadUrl: string;
    multiMacDownloadUrl: string;
    localCopierSubscriptionLimits: string;
    resendApiKey: string | null;
    resendTestEmail: string | null;
    emailFrom: string | null;
    resendInboundWebhookSecret: string | null;
    discordWebhookUrl: string | null;
    discordDailyReportWebhookUrl: string | null;
    openaiApiKey: string | null;
    openaiModel: string | null;
    internalApiKey: string | null;
    stripeSecretKey: string | null;
    stripeWebhookSecret: string | null;
    bisbiProMonthlyPriceId: string | null;
    bisbiProAnnualPriceId: string | null;
    bisbiProMonthlyAmount: number | null;
    bisbiProAnnualAmount: number | null;
    bisbiFreeMonthlyWordLimit: number | null;
  }>
) {
  const settings = await db
    .select()
    .from(appSettings)
    .orderBy(appSettings.id)
    .limit(1);

  try {
    if (settings.length === 0) {
      const defaultLimits =
        data.localCopierSubscriptionLimits ||
        JSON.stringify({
          free: { accountLimit: 1, fixedLotSize: 0.01 },
          pro: { accountLimit: 8, fixedLotSize: null },
          unlimited: { accountLimit: null, fixedLotSize: null },
        });
      const result = await db
        .insert(appSettings)
        .values({
          multiVersion: data.multiVersion || "1.0.0",
          multiWindowsDownloadUrl: data.multiWindowsDownloadUrl || "",
          multiMacDownloadUrl: data.multiMacDownloadUrl || "",
          localCopierSubscriptionLimits: defaultLimits,
          resendApiKey: data.resendApiKey ?? null,
          resendTestEmail: data.resendTestEmail ?? null,
          emailFrom: data.emailFrom ?? null,
          resendInboundWebhookSecret: data.resendInboundWebhookSecret ?? null,
          discordDailyReportWebhookUrl: data.discordDailyReportWebhookUrl ?? null,
          openaiApiKey: data.openaiApiKey ?? null,
          openaiModel: data.openaiModel ?? null,
          internalApiKey: data.internalApiKey ?? generateInternalApiKey(),
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

      if (data.multiVersion !== undefined) {
        updateData.multiVersion = data.multiVersion;
      }
      if (data.multiWindowsDownloadUrl !== undefined) {
        updateData.multiWindowsDownloadUrl = data.multiWindowsDownloadUrl;
      }
      if (data.multiMacDownloadUrl !== undefined) {
        updateData.multiMacDownloadUrl = data.multiMacDownloadUrl;
      }
      if (data.localCopierSubscriptionLimits !== undefined) {
        updateData.localCopierSubscriptionLimits =
          data.localCopierSubscriptionLimits;
      }
      if (data.resendApiKey !== undefined) {
        updateData.resendApiKey = data.resendApiKey ?? null;
      }
      if (data.resendTestEmail !== undefined) {
        updateData.resendTestEmail = data.resendTestEmail ?? null;
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
      if (data.openaiApiKey !== undefined) {
        updateData.openaiApiKey = data.openaiApiKey?.trim() || null;
      }
      if (data.openaiModel !== undefined) {
        updateData.openaiModel = data.openaiModel?.trim() || null;
      }
      if (data.internalApiKey !== undefined) {
        updateData.internalApiKey = data.internalApiKey?.trim() || null;
      }
      if (data.stripeSecretKey !== undefined) {
        updateData.stripeSecretKey = data.stripeSecretKey?.trim() || null;
      }
      if (data.stripeWebhookSecret !== undefined) {
        updateData.stripeWebhookSecret = data.stripeWebhookSecret?.trim() || null;
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

