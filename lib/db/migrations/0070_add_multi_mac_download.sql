ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "multiMacVersion" varchar(20) NOT NULL DEFAULT '1.0.0';
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "multiMacDownloadUrl" text;
