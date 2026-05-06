
CREATE TABLE IF NOT EXISTS "cronLock" (
  "id" serial PRIMARY KEY,
  "jobName" varchar(100) NOT NULL UNIQUE,
  "lockKey" integer NOT NULL UNIQUE,
  "lastRunAt" timestamp,
  "lastRunBy" text,
  "lastRunDurationMs" integer,
  "lastRunStatus" varchar(20),
  "lastRunError" text,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

INSERT INTO "cronLock" ("jobName", "lockKey") VALUES
  ('subscription-check-scheduler', 1004)
ON CONFLICT ("jobName") DO NOTHING;

CREATE INDEX IF NOT EXISTS "cronLock_jobName_idx" ON "cronLock"("jobName");

COMMENT ON TABLE "cronLock" IS 'Tracks cron job execution across multiple instances using PostgreSQL advisory locks. Jobs: subscription-check-scheduler';

