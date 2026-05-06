
ALTER TABLE "appSettings" 
  DROP COLUMN IF EXISTS "contaboDefaultImageId";

COMMENT ON TABLE "appSettings" IS 'App settings. Note: contaboDefaultImageId was removed - use snapshotImageId instead.';
