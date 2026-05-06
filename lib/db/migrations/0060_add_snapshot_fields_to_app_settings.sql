
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "snapshotImageId" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "snapshotVpsId" uuid REFERENCES "contaboVps"("id") ON DELETE SET NULL;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "snapshotLastUpdatedAt" timestamp;

COMMENT ON COLUMN "appSettings"."snapshotImageId" IS 'Current imageId from the snapshot VPS. Updated every 24 hours. Used as base image for creating new VPS instances.';
COMMENT ON COLUMN "appSettings"."snapshotVpsId" IS 'Reference to the VPS marked as snapshot (isSnapshot = true). Only one VPS should be snapshot at a time.';
COMMENT ON COLUMN "appSettings"."snapshotLastUpdatedAt" IS 'Timestamp of the last successful snapshot update. Used to track when the next update is due.';
