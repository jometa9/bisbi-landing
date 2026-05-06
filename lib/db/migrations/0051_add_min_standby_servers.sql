
ALTER TABLE "appSettings" 
ADD COLUMN "minStandbyServers" integer DEFAULT 1 NOT NULL;

COMMENT ON COLUMN "appSettings"."minStandbyServers" IS 'Minimum number of empty server pairs (CTR + MT nodes with same IP) to keep ready for immediate assignment. Default: 1';
