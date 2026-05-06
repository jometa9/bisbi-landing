ALTER TABLE "cloudAccount"
  ADD COLUMN IF NOT EXISTS "tcpUrl" text;
ALTER TABLE "cloudAccount"
  ADD COLUMN IF NOT EXISTS "apiUrl" text;

