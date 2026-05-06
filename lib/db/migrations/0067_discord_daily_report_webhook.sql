ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "discordDailyReportWebhookUrl" text;

INSERT INTO "cronLock" ("jobName", "lockKey") VALUES
  ('daily-saas-report', 1005)
ON CONFLICT ("jobName") DO NOTHING;

COMMENT ON TABLE "cronLock" IS 'Tracks cron job execution across multiple instances using PostgreSQL advisory locks. Jobs: subscription-check-scheduler, daily-saas-report';
