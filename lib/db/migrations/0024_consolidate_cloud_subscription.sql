
ALTER TABLE "userProductSubscription" ADD COLUMN IF NOT EXISTS "accountLimit" integer;


INSERT INTO "userProductSubscription" (
  "userId",
  "productKey",
  "tier",
  "accountLimit",
  "status",
  "stripeSubscriptionId",
  "stripeProductId",
  "planName",
  "expiresAt",
  "metaPurchaseEventId",
  "createdAt",
  "updatedAt"
)
SELECT 
  "userId",
  'cloud_copier' as "productKey",
  'premium' as "tier",
  NULL as "accountLimit",
  "status",
  "stripeSubscriptionId",
  "stripeProductId",
  "planName",
  "expiresAt",
  "metaPurchaseEventId",
  "createdAt",
  "updatedAt"
FROM "userCloudSubscription"
WHERE NOT EXISTS (
  SELECT 1 FROM "userProductSubscription" 
  WHERE "userProductSubscription"."userId" = "userCloudSubscription"."userId"
    AND "userProductSubscription"."productKey" = 'cloud_copier'
)
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS "userCloudSubscription";

