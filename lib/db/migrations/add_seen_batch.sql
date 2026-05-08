CREATE TABLE IF NOT EXISTS "seenBatch" (
  "batchId" TEXT PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productKey" VARCHAR(20) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "seenBatch_expiresAt_idx"
  ON "seenBatch"("expiresAt");
