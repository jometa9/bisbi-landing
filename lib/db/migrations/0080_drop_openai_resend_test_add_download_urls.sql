-- Drop unused OpenAI and resendTestEmail columns from appSettings.
-- The OpenAI assistant feature was removed; resendTestEmail was unused in UI and email routing
-- now sends directly to the original recipient.
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "openaiApiKey";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "openaiModel";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "resendTestEmail";

-- Replace dynamic GitHub-API release discovery with admin-managed fixed URLs per OS.
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "bisbiWindowsDownloadUrl" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "bisbiMacDownloadUrl" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "bisbiLinuxDownloadUrl" text;
