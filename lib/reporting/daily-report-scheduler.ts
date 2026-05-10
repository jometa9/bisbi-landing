import { runDailyReportJob } from "@/lib/reporting/run-daily-report-job";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

let checkInterval: NodeJS.Timeout | null = null;

export function startDailyReportScheduler() {
  if (checkInterval) {
    return;
  }

  runDailyReportJob().then((outcome) => {
    if (!outcome.ok) {
      console.error(`[Daily Report] ${outcome.error}`);
    }
  });

  checkInterval = setInterval(async () => {
    const outcome = await runDailyReportJob();
    if (!outcome.ok) {
      console.error(`[Daily Report] ${outcome.error}`);
    }
  }, CHECK_INTERVAL_MS);
}

export function stopDailyReportScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
