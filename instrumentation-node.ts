import { startSubscriptionCheckScheduler } from "@/lib/subscriptions/subscription-check-scheduler";
import { startDailyReportScheduler } from "@/lib/reporting/daily-report-scheduler";

startSubscriptionCheckScheduler();
startDailyReportScheduler();
