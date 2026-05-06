export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSubscriptionCheckScheduler } =
      await import("@/lib/subscriptions/subscription-check-scheduler");
    const { startDailyReportScheduler } =
      await import("@/lib/reporting/daily-report-scheduler");

    startSubscriptionCheckScheduler();
    startDailyReportScheduler();
  }
}
