ALTER TABLE "appSettings"
  ADD COLUMN IF NOT EXISTS "contaboUsername" text,
  ADD COLUMN IF NOT EXISTS "contaboPassword" text;

COMMENT ON COLUMN "appSettings"."contaboUsername" IS 'Contabo account email (for OAuth2 password grant)';
COMMENT ON COLUMN "appSettings"."contaboPassword" IS 'Contabo account password (for OAuth2 password grant)';
