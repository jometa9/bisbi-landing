ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "inboxRetentionDays";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "openaiAssistantInstructions";
ALTER TABLE "user" DROP COLUMN IF EXISTS "metaPurchaseEventId";
ALTER TABLE "user" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "user" DROP COLUMN IF EXISTS "image";
