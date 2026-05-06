ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "bridgeToken" TEXT;

UPDATE "appSettings" 
SET "bridgeToken" = 'ISPETCRRAEDTEED'
WHERE "bridgeToken" IS NULL;

