
DELETE FROM "userProductSubscription" WHERE "productKey" = 'ctr';

ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "ctrWindowsVersion";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "ctrWindowsDownloadUrl";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "ctrMacVersion";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "ctrMacDownloadUrl";
