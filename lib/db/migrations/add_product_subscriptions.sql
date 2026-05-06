
ALTER TABLE "user" DROP COLUMN IF EXISTS "stripeSubscriptionId";
ALTER TABLE "user" DROP COLUMN IF EXISTS "stripeProductId";
ALTER TABLE "user" DROP COLUMN IF EXISTS "planName";
ALTER TABLE "user" DROP COLUMN IF EXISTS "subscriptionStatus";
ALTER TABLE "user" DROP COLUMN IF EXISTS "subscriptionExpiryDate";

ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "appVersion";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "downloadUrl";

CREATE TABLE IF NOT EXISTS "userProductSubscription" (
  "id" SERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productKey" VARCHAR(20) NOT NULL,
  "tier" VARCHAR(20) NOT NULL DEFAULT 'free',
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripeProductId" TEXT,
  "planName" VARCHAR(50),
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "userProductSubscription_userId_productKey_idx" 
  ON "userProductSubscription"("userId", "productKey");

CREATE INDEX IF NOT EXISTS "userProductSubscription_stripeSubscriptionId_idx" 
  ON "userProductSubscription"("stripeSubscriptionId");

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "multiWindowsVersion" VARCHAR(20) NOT NULL DEFAULT '1.0.0';
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "multiWindowsDownloadUrl" TEXT;

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctrWindowsVersion" VARCHAR(20) NOT NULL DEFAULT '1.0.0';
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctrWindowsDownloadUrl" TEXT;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctrMacVersion" VARCHAR(20) NOT NULL DEFAULT '1.0.0';
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctrMacDownloadUrl" TEXT;
