
CREATE TABLE IF NOT EXISTS "pendingAccountConfiguration" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "accountId" uuid NOT NULL REFERENCES "cloudAccount"("id") ON DELETE CASCADE,

  "configType" varchar(50) NOT NULL,

  "configPayload" jsonb NOT NULL,

  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "lastAttemptAt" timestamp,
  "lastError" text,
  "attemptCount" integer NOT NULL DEFAULT 0,
  "maxAttempts" integer NOT NULL DEFAULT 100,

  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "completedAt" timestamp
);

CREATE INDEX IF NOT EXISTS "pendingAccountConfiguration_accountId_idx" 
  ON "pendingAccountConfiguration"("accountId");

CREATE INDEX IF NOT EXISTS "pendingAccountConfiguration_status_idx" 
  ON "pendingAccountConfiguration"("status");

CREATE INDEX IF NOT EXISTS "pendingAccountConfiguration_status_createdAt_idx" 
  ON "pendingAccountConfiguration"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "pendingAccountConfiguration_pending_retry_idx" 
  ON "pendingAccountConfiguration"("status", "lastAttemptAt") 
  WHERE "status" = 'pending' OR ("status" = 'processing' AND "lastAttemptAt" < now() - interval '2 minutes');
