ALTER TABLE "appSettings" 
  ADD COLUMN IF NOT EXISTS "contaboDefaultImageId" text;

UPDATE "appSettings" 
SET "contaboDefaultImageId" = 'windows-2022-datacenter'
WHERE "contaboDefaultImageId" IS NULL;
