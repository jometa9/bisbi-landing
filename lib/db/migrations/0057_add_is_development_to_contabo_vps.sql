
ALTER TABLE "contaboVps" ADD COLUMN IF NOT EXISTS "isDevelopment" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "contaboVps_isDevelopment_idx" ON "contaboVps"("isDevelopment");
