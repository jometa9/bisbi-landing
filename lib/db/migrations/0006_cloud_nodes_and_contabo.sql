CREATE TABLE IF NOT EXISTS "cloudNode" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiType" varchar(10) NOT NULL,
  "apiUrl" text,
  "tunnelUrl" text,
  "tunnelActive" boolean NOT NULL DEFAULT false,
  "publicIp" varchar(50) NOT NULL UNIQUE,
  "localIp" varchar(50),
  "port" integer,
  "status" varchar(20) NOT NULL DEFAULT 'unknown',
  "lastHeartbeatAt" timestamp,
  "lastCapacity" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "cloudAccount"
  ADD COLUMN IF NOT EXISTS "nodeId" uuid REFERENCES "cloudNode"("id") ON DELETE SET NULL;

ALTER TABLE "cloudAccount"
  ADD COLUMN IF NOT EXISTS "desiredNodeId" uuid REFERENCES "cloudNode"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "cloudAccount_nodeId_idx" ON "cloudAccount"("nodeId");
CREATE INDEX IF NOT EXISTS "cloudAccount_desiredNodeId_idx" ON "cloudAccount"("desiredNodeId");

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboClientId" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboClientSecret" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboApiUser" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboApiPassword" text;






