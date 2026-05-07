-- Rename product key from "multi" to "bisbi" everywhere it appears
UPDATE "userProductSubscription" SET "productKey" = 'bisbi' WHERE "productKey" = 'multi';
UPDATE "userMonthlyUsage" SET "productKey" = 'bisbi' WHERE "productKey" = 'multi';

-- Drop legacy app version / download URL columns (handled by Bisbi auto-updater via GitHub releases)
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "multiVersion";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "multiWindowsDownloadUrl";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "multiMacDownloadUrl";

-- Drop unused account-limit / fixed-lot legacy subscription limits (Bisbi only uses bisbiFreeMonthlyWordLimit)
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "localCopierSubscriptionLimits";

-- Drop legacy per-subscription columns (accountLimit and metaPurchaseEventId are no longer used)
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "accountLimit";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "metaPurchaseEventId";
