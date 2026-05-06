
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "subscriptionHistory" CASCADE;
DROP TABLE IF EXISTS "verificationToken" CASCADE;

ALTER TABLE "user" DROP COLUMN IF EXISTS "serverIP";
ALTER TABLE "user" DROP COLUMN IF EXISTS "firstSubscriptionDate";
ALTER TABLE "user" DROP COLUMN IF EXISTS "lastCancellationDate";
ALTER TABLE "user" DROP COLUMN IF EXISTS "totalSubscriptionMonths";
