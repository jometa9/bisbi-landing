CREATE TABLE IF NOT EXISTS "mthServer" (
  "id" serial PRIMARY KEY NOT NULL,
  "company" text NOT NULL,
  "name" text NOT NULL,
  "logoUrl" text,
  "site" text,
  "access" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "mthServer_company_name_unique_idx"
  ON "mthServer" ("company", "name");

CREATE INDEX IF NOT EXISTS "mthServer_company_idx"
  ON "mthServer" ("company");

CREATE INDEX IF NOT EXISTS "mthServer_name_idx"
  ON "mthServer" ("name");
