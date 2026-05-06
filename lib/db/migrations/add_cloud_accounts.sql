CREATE TABLE IF NOT EXISTS "cloudAccount" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,

  "serviceType" varchar(30) NOT NULL,

  "platform" varchar(30) NOT NULL,

  "accountId" varchar(100) NOT NULL,
  "nickname" varchar(50),

  "accountRole" varchar(20) NOT NULL DEFAULT 'pending',

  "masterAccountId" uuid,

  "copyConfig" jsonb,

  "credentials" jsonb,

  "enabled" boolean NOT NULL DEFAULT true,
  "connectionStatus" varchar(20) NOT NULL DEFAULT 'disconnected',
  "lastSyncAt" timestamp,

  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cloudAccount_userId_idx" ON "cloudAccount"("userId");
CREATE INDEX IF NOT EXISTS "cloudAccount_serviceType_idx" ON "cloudAccount"("serviceType");
CREATE INDEX IF NOT EXISTS "cloudAccount_masterAccountId_idx" ON "cloudAccount"("masterAccountId");

ALTER TABLE "cloudAccount" 
  ADD CONSTRAINT "cloudAccount_masterAccountId_fkey" 
  FOREIGN KEY ("masterAccountId") 
  REFERENCES "cloudAccount"("id") 
  ON DELETE SET NULL;

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctraderClientId" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctraderClientSecret" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "ctraderRedirectUri" text;
