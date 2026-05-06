-- Adds monthly word-usage tracking for Bisbi (per-user, per-month accumulator)
-- and a configurable free-plan word limit on appSettings.

ALTER TABLE "appSettings"
ADD COLUMN IF NOT EXISTS "bisbiFreeMonthlyWordLimit" INTEGER;

COMMENT ON COLUMN "appSettings"."bisbiFreeMonthlyWordLimit" IS
  'Monthly word limit for Bisbi free tier. NULL falls back to the application default (2000).';

CREATE TABLE IF NOT EXISTS "userMonthlyUsage" (
  "id" SERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productKey" VARCHAR(20) NOT NULL,
  "monthKey" VARCHAR(7) NOT NULL,
  "wordsUsed" INTEGER NOT NULL DEFAULT 0,
  "audioSeconds" INTEGER NOT NULL DEFAULT 0,
  "transcriptionsCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "userMonthlyUsage_user_product_month_idx"
  ON "userMonthlyUsage" ("userId", "productKey", "monthKey");

COMMENT ON TABLE "userMonthlyUsage" IS
  'Per-user, per-month, per-product accumulator of transcription usage. Source of truth for free-plan limit enforcement; the desktop app keeps a local cache and reconciles against this.';
