-- Admin-managed Bisbi desktop app version. The desktop app compares its own
-- version against this value (returned in every API response) and shows an
-- update banner when they differ.
ALTER TABLE "appSettings" ADD COLUMN IF NOT EXISTS "bisbiAppVersion" text;
