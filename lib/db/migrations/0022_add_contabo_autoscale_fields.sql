ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboGoldenImageCtr" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboGoldenImageMt" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboDefaultProductId" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboDefaultRegion" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "contaboAutoScaleEnabled" boolean DEFAULT false;






