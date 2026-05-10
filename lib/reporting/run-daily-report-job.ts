import { executeWithLock } from "@/lib/cron/distributed-lock";
import { getAppSettings } from "@/lib/db/queries";
import { collectDailySaasMetrics } from "@/lib/reporting/daily-saas-metrics";
import { postDailyReportToDiscord } from "@/lib/reporting/discord-daily-report";

const JOB = "daily-saas-report";
const LOCK_KEY = 1005;

export type DailyReportJobResponse =
  | {
      ok: true;
      skipped: true;
      reason: string;
    }
  | {
      ok: true;
      skipped: false;
      data: { metricsSummary: { newUsers24h: number } };
    }
  | {
      ok: false;
      error: string;
    };

export async function runDailyReportJob(): Promise<DailyReportJobResponse> {
  const settings = await getAppSettings();
  const webhookUrl = settings.discordDailyReportWebhookUrl?.trim();

  if (!webhookUrl) {
    return {
      ok: true,
      skipped: true,
      reason: "discordDailyReportWebhookUrl not configured",
    };
  }

  const lockResult = await executeWithLock(
    JOB,
    LOCK_KEY,
    async () => {
      const metrics = await collectDailySaasMetrics();
      await postDailyReportToDiscord(webhookUrl, metrics);
      return { metricsSummary: { newUsers24h: metrics.newUsers24h } };
    },
    { timeout: 3 * 60 * 1000 }
  );

  if (!lockResult.acquired) {
    return {
      ok: true,
      skipped: true,
      reason:
        lockResult.error || "Another instance is already running the report",
    };
  }

  if (lockResult.error) {
    return { ok: false, error: lockResult.error };
  }

  return {
    ok: true,
    skipped: false,
    data: lockResult.result!,
  };
}
