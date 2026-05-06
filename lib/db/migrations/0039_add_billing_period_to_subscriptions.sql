
ALTER TABLE "userProductSubscription" 
ADD COLUMN IF NOT EXISTS "billingPeriod" VARCHAR(10);

COMMENT ON COLUMN "userProductSubscription"."billingPeriod" IS 'Billing period: monthly or annual. Stored to preserve even after subscription cancellation.';

