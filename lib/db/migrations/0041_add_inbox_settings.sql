
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "resendApiKey" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "resendTestEmail" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "emailFrom" text;

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "resendInboundWebhookSecret" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "inboxRetentionDays" integer;

