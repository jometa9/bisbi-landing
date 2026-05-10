import { getLockStatus } from "@/lib/cron/distributed-lock";
import { runDailyReportJob } from "@/lib/reporting/run-daily-report-job";

const ART_TZ = "America/Argentina/Buenos_Aires";
const CHECK_INTERVAL_MS = 60 * 1000;
const JOB_NAME = "daily-saas-report";
const WINDOW_HOUR_ART = 7;

let checkInterval: NodeJS.Timeout | null = null;

function getArtDayKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ART_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

function getArtHour(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ART_TZ,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  return parseInt(parts.find((p) => p.type === "hour")!.value, 10);
}

async function alreadyRanToday(now: Date): Promise<boolean> {
  try {
    const lock = await getLockStatus(JOB_NAME);
    if (!lock?.lastRunAt) return false;
    if (lock.lastRunStatus !== "success") return false;
    return getArtDayKey(lock.lastRunAt) === getArtDayKey(now);
  } catch (e) {
    console.error("[Daily Report] failed reading lock status:", e);
    return false;
  }
}

async function tickIfWindow(): Promise<void> {
  const now = new Date();
  if (getArtHour(now) !== WINDOW_HOUR_ART) return;
  if (await alreadyRanToday(now)) return;

  console.log(
    `[Daily Report] Triggering for ART day ${getArtDayKey(now)} at ${now.toISOString()}`
  );

  const outcome = await runDailyReportJob();
  if (!outcome.ok) {
    console.error(`[Daily Report] Failed: ${outcome.error}`);
    return;
  }
  if (outcome.skipped) {
    console.warn(`[Daily Report] Skipped: ${outcome.reason}`);
    return;
  }
  console.log(
    `[Daily Report] Sent (newUsers24h=${outcome.data.metricsSummary.newUsers24h})`
  );
}

export function startDailyReportScheduler() {
  if (checkInterval) {
    return;
  }

  tickIfWindow().catch((e) =>
    console.error("[Daily Report] initial tick:", e)
  );

  checkInterval = setInterval(() => {
    tickIfWindow().catch((e) => console.error("[Daily Report] tick:", e));
  }, CHECK_INTERVAL_MS);
}

export function stopDailyReportScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
