ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "subscriptionLimits" text;

UPDATE "appSettings" 
SET "subscriptionLimits" = '{"free":{"accountLimit":1,"fixedLotSize":0.01},"premium":{"accountLimit":3,"fixedLotSize":null},"unlimited":{"accountLimit":null,"fixedLotSize":null}}'
WHERE "subscriptionLimits" IS NULL;

