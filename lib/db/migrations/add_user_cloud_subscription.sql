
CREATE TABLE IF NOT EXISTS "userCloudSubscription" (
  "id" SERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "serviceType" VARCHAR(30) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripeProductId" TEXT,
  "planName" VARCHAR(80),
  "expiresAt" TIMESTAMP,
  "metaPurchaseEventId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "userCloudSubscription_userId_serviceType_idx" 
  ON "userCloudSubscription"("userId", "serviceType");

CREATE INDEX IF NOT EXISTS "userCloudSubscription_stripeSubscriptionId_idx" 
  ON "userCloudSubscription"("stripeSubscriptionId");






