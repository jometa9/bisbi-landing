import {
  getAppSettings,
  getSubscriptionLimits,
  getUser,
  updateAppSettings,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getAppSettings();
    const subscriptionLimits = getSubscriptionLimits(settings);

    return NextResponse.json({
      multiVersion: settings.multiVersion,
      multiWindowsDownloadUrl: settings.multiWindowsDownloadUrl || "",
      multiMacDownloadUrl: settings.multiMacDownloadUrl || "",
      subscriptionLimits,
      resendApiKey: settings.resendApiKey || "",
      resendTestEmail: settings.resendTestEmail || "",
      emailFrom: settings.emailFrom || "",
      resendInboundWebhookSecret: settings.resendInboundWebhookSecret || "",
      discordWebhookUrl: settings.discordWebhookUrl || "",
      discordDailyReportWebhookUrl: settings.discordDailyReportWebhookUrl || "",
      openaiApiKey: settings.openaiApiKey || "",
      openaiModel: settings.openaiModel || "",
      internalApiKey: settings.internalApiKey || "",
      stripeSecretKey: settings.stripeSecretKey || "",
      stripeWebhookSecret: settings.stripeWebhookSecret || "",
      bisbiProMonthlyPriceId: settings.bisbiProMonthlyPriceId || "",
      bisbiProAnnualPriceId: settings.bisbiProAnnualPriceId || "",
      bisbiProMonthlyAmount: settings.bisbiProMonthlyAmount ?? 1000,
      bisbiProAnnualAmount: settings.bisbiProAnnualAmount ?? 9600,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      multiVersion,
      multiWindowsDownloadUrl,
      multiMacDownloadUrl,
      subscriptionLimits,
      resendApiKey,
      resendTestEmail,
      emailFrom,
      resendInboundWebhookSecret,
      discordWebhookUrl,
      discordDailyReportWebhookUrl,
      openaiApiKey,
      openaiModel,
      internalApiKey,
      stripeSecretKey,
      stripeWebhookSecret,
      bisbiProMonthlyPriceId,
      bisbiProAnnualPriceId,
      bisbiProMonthlyAmount,
      bisbiProAnnualAmount,
    } = body;

    let subscriptionLimitsJson: string | undefined;
    if (subscriptionLimits) {
      if (
        typeof subscriptionLimits === "object" &&
        subscriptionLimits.free &&
        subscriptionLimits.unlimited
      ) {
        if (!subscriptionLimits.pro) {
          subscriptionLimits.pro = { accountLimit: 8, fixedLotSize: null };
        }
        subscriptionLimitsJson = JSON.stringify(subscriptionLimits);
      } else {
        return NextResponse.json(
          {
            error:
              "Subscription limits must have free and unlimited plans",
          },
          { status: 400 }
        );
      }
    }

    const updateData: Parameters<typeof updateAppSettings>[1] = {
      multiVersion: multiVersion?.trim(),
      multiWindowsDownloadUrl: multiWindowsDownloadUrl?.trim(),
      multiMacDownloadUrl: multiMacDownloadUrl?.trim(),
      localCopierSubscriptionLimits: subscriptionLimitsJson,
    };

    if (resendApiKey !== undefined) {
      updateData.resendApiKey = resendApiKey?.trim() || null;
    }
    if (resendTestEmail !== undefined) {
      updateData.resendTestEmail = resendTestEmail?.trim() || null;
    }
    if (emailFrom !== undefined) {
      updateData.emailFrom = emailFrom?.trim() || null;
    }

    if (resendInboundWebhookSecret !== undefined) {
      updateData.resendInboundWebhookSecret = resendInboundWebhookSecret?.trim() || null;
    }
    if (discordWebhookUrl !== undefined) {
      updateData.discordWebhookUrl = discordWebhookUrl?.trim() || null;
    }
    if (discordDailyReportWebhookUrl !== undefined) {
      updateData.discordDailyReportWebhookUrl =
        discordDailyReportWebhookUrl?.trim() || null;
    }
    if (openaiApiKey !== undefined) {
      updateData.openaiApiKey = openaiApiKey?.trim() || null;
    }
    if (openaiModel !== undefined) {
      updateData.openaiModel = openaiModel?.trim() || null;
    }
    if (internalApiKey !== undefined) {
      updateData.internalApiKey = internalApiKey?.trim() || null;
    }
    if (stripeSecretKey !== undefined) {
      updateData.stripeSecretKey = stripeSecretKey?.trim() || null;
    }
    if (stripeWebhookSecret !== undefined) {
      updateData.stripeWebhookSecret = stripeWebhookSecret?.trim() || null;
    }
    if (bisbiProMonthlyPriceId !== undefined) {
      updateData.bisbiProMonthlyPriceId = bisbiProMonthlyPriceId?.trim() || null;
    }
    if (bisbiProAnnualPriceId !== undefined) {
      updateData.bisbiProAnnualPriceId = bisbiProAnnualPriceId?.trim() || null;
    }
    if (bisbiProMonthlyAmount !== undefined) {
      updateData.bisbiProMonthlyAmount = typeof bisbiProMonthlyAmount === "number" ? bisbiProMonthlyAmount : null;
    }
    if (bisbiProAnnualAmount !== undefined) {
      updateData.bisbiProAnnualAmount = typeof bisbiProAnnualAmount === "number" ? bisbiProAnnualAmount : null;
    }

    const [{ clearEmailConfigCache }, { clearStripeCache }] = await Promise.all([
      import("@/lib/email/config"),
      import("@/lib/payments/stripe"),
    ]);
    clearEmailConfigCache();
    if (stripeSecretKey !== undefined) clearStripeCache();

    const updatedSettings = await updateAppSettings(user.id, updateData);

    const updatedSubscriptionLimits = getSubscriptionLimits(updatedSettings);

    return NextResponse.json({
      success: true,
      multiVersion: updatedSettings.multiVersion,
      multiWindowsDownloadUrl: updatedSettings.multiWindowsDownloadUrl,
      multiMacDownloadUrl: updatedSettings.multiMacDownloadUrl,
      subscriptionLimits: updatedSubscriptionLimits,
      resendApiKey: updatedSettings.resendApiKey || "",
      resendTestEmail: updatedSettings.resendTestEmail || "",
      emailFrom: updatedSettings.emailFrom || "",
      resendInboundWebhookSecret: updatedSettings.resendInboundWebhookSecret || "",
      discordWebhookUrl: updatedSettings.discordWebhookUrl || "",
      discordDailyReportWebhookUrl: updatedSettings.discordDailyReportWebhookUrl || "",
      openaiApiKey: updatedSettings.openaiApiKey || "",
      openaiModel: updatedSettings.openaiModel || "",
      internalApiKey: updatedSettings.internalApiKey || "",
      stripeSecretKey: updatedSettings.stripeSecretKey || "",
      stripeWebhookSecret: updatedSettings.stripeWebhookSecret || "",
      bisbiProMonthlyPriceId: updatedSettings.bisbiProMonthlyPriceId || "",
      bisbiProAnnualPriceId: updatedSettings.bisbiProAnnualPriceId || "",
      bisbiProMonthlyAmount: updatedSettings.bisbiProMonthlyAmount ?? 1000,
      bisbiProAnnualAmount: updatedSettings.bisbiProAnnualAmount ?? 9600,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
