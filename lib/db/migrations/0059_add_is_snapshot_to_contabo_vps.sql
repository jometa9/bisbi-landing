
ALTER TABLE "contaboVps" ADD COLUMN IF NOT EXISTS "isSnapshot" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "contaboVps_isSnapshot_idx" ON "contaboVps"("isSnapshot");

COMMENT ON COLUMN "contaboVps"."isSnapshot" IS 'If true, this VPS is used as snapshot/golden image source. Its nodes are excluded from routing and capacity calculations.';
