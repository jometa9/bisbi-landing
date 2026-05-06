ALTER TABLE "cloudNode" DROP COLUMN IF EXISTS "localIp";
ALTER TABLE "cloudNode" DROP COLUMN IF EXISTS "port";

ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboGoldenImage" text;

UPDATE "appSettings" 
SET "contaboGoldenImage" = COALESCE("contaboGoldenImageCtr", "contaboGoldenImageMt")
WHERE "contaboGoldenImage" IS NULL;

ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "contaboGoldenImageCtr";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "contaboGoldenImageMt";

