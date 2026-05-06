
ALTER TABLE "cloudAccount"
  ADD COLUMN IF NOT EXISTS "masterTcpUrl" text,
  ADD COLUMN IF NOT EXISTS "lotType" varchar(20),
  ADD COLUMN IF NOT EXISTS "lotMultiplier" numeric(10, 2),
  ADD COLUMN IF NOT EXISTS "fixedLot" numeric(10, 2),
  ADD COLUMN IF NOT EXISTS "reverseTrading" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "prefixEnabled" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "prefixValue" text,
  ADD COLUMN IF NOT EXISTS "prefixAction" varchar(10),
  ADD COLUMN IF NOT EXISTS "suffixEnabled" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "suffixValue" text,
  ADD COLUMN IF NOT EXISTS "suffixAction" varchar(10),
  ADD COLUMN IF NOT EXISTS "symbolTranslations" jsonb;

ALTER TABLE "cloudAccount"
  ADD CONSTRAINT IF NOT EXISTS "cloudAccount_lotType_check" 
  CHECK ("lotType" IS NULL OR "lotType" IN ('multiplier', 'fixedlot'));

ALTER TABLE "cloudAccount"
  ADD CONSTRAINT IF NOT EXISTS "cloudAccount_prefixAction_check" 
  CHECK ("prefixAction" IS NULL OR "prefixAction" IN ('add', 'remove'));

ALTER TABLE "cloudAccount"
  ADD CONSTRAINT IF NOT EXISTS "cloudAccount_suffixAction_check" 
  CHECK ("suffixAction" IS NULL OR "suffixAction" IN ('add', 'remove'));

