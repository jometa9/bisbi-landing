CREATE TABLE IF NOT EXISTS "contaboVps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contaboInstanceId" integer NOT NULL UNIQUE,
  "publicIp" varchar(50) NOT NULL,
  "adminUser" text,
  "adminPasswordEncrypted" text,
  "productId" varchar(20),
  "region" varchar(20),
  "status" varchar(20) NOT NULL DEFAULT 'provisioning',
  "displayName" text,
  "notes" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "lastCheckedAt" timestamp,
  "terminatedAt" timestamp
);

ALTER TABLE "cloudNode"
  ADD COLUMN IF NOT EXISTS "vpsId" uuid REFERENCES "contaboVps"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "cloudNode_vpsId_idx" ON "cloudNode"("vpsId");

ALTER TABLE "appSettings"
  ADD COLUMN IF NOT EXISTS "windowsBootstrapEnabled" boolean DEFAULT false;

ALTER TABLE "appSettings"
  ADD COLUMN IF NOT EXISTS "bootstrapScriptUrl" text;

ALTER TABLE "appSettings"
  ADD COLUMN IF NOT EXISTS "defaultWindowsUser" text;

ALTER TABLE "appSettings"
  ADD COLUMN IF NOT EXISTS "defaultWindowsPassword" text;

CREATE INDEX IF NOT EXISTS "contaboVps_status_idx" ON "contaboVps"("status");

CREATE INDEX IF NOT EXISTS "contaboVps_publicIp_idx" ON "contaboVps"("publicIp");
