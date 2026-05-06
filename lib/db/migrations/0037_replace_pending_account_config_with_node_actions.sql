
DROP INDEX IF EXISTS "pendingAccountConfiguration_pending_retry_idx";
DROP INDEX IF EXISTS "pendingAccountConfiguration_status_createdAt_idx";
DROP INDEX IF EXISTS "pendingAccountConfiguration_status_idx";
DROP INDEX IF EXISTS "pendingAccountConfiguration_accountId_idx";
DROP TABLE IF EXISTS "pendingAccountConfiguration";

CREATE TABLE IF NOT EXISTS "pendingNodeAction" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "accountId" uuid NOT NULL REFERENCES "cloudAccount"("id") ON DELETE CASCADE,

  "actionType" varchar(20) NOT NULL,

  "actionPayload" jsonb NOT NULL,

  "priority" integer NOT NULL,

  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "lastAttemptAt" timestamp,
  "lastError" text,
  "attemptCount" integer NOT NULL DEFAULT 0,
  "maxAttempts" integer NOT NULL DEFAULT 100,

  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "completedAt" timestamp
);

CREATE INDEX IF NOT EXISTS "pendingNodeAction_accountId_idx" 
  ON "pendingNodeAction"("accountId");

CREATE INDEX IF NOT EXISTS "pendingNodeAction_status_idx" 
  ON "pendingNodeAction"("status");

CREATE INDEX IF NOT EXISTS "pendingNodeAction_status_priority_createdAt_idx" 
  ON "pendingNodeAction"("status", "priority", "createdAt");

CREATE INDEX IF NOT EXISTS "pendingNodeAction_pending_retry_idx" 
  ON "pendingNodeAction"("status", "priority", "lastAttemptAt") 
  WHERE "status" = 'pending' OR ("status" = 'processing' AND "lastAttemptAt" < now() - interval '2 minutes');
