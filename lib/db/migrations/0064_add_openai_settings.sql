ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "openaiApiKey" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "openaiModel" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "openaiAssistantInstructions" text;
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "openaiAssistantId" text;

COMMENT ON COLUMN "appSettings"."openaiApiKey" IS 'OpenAI API key for the chat assistant. Set in Admin → Settings.';
COMMENT ON COLUMN "appSettings"."openaiModel" IS 'Model for Responses API e.g. gpt-4o. Default in code if empty.';
COMMENT ON COLUMN "appSettings"."openaiAssistantInstructions" IS 'System/instructions for the assistant (Responses API). Replaces legacy assistant behaviour.';
COMMENT ON COLUMN "appSettings"."openaiAssistantId" IS 'Legacy Assistants API ID; kept for reference only. Not used by Responses API.';
