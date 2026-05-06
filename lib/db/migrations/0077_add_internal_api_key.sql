ALTER TABLE "appSettings"
ADD COLUMN IF NOT EXISTS "internalApiKey" TEXT;

COMMENT ON COLUMN "appSettings"."internalApiKey" IS 'API key for the internal automation endpoint (POST /api/internal/v1/...). Configurable from the admin settings UI.';
