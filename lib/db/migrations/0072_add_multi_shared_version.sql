ALTER TABLE "appSettings"
ADD COLUMN IF NOT EXISTS "multiVersion" varchar(20) NOT NULL DEFAULT '1.0.0';

UPDATE "appSettings"
SET "multiVersion" = COALESCE(NULLIF("multiWindowsVersion", ''), NULLIF("multiMacVersion", ''), '1.0.0')
WHERE "multiVersion" IS NULL OR "multiVersion" = '';
