
ALTER TABLE "cloudNode"
  ADD COLUMN IF NOT EXISTS "cpuUsagePercent" numeric(5, 2),
  ADD COLUMN IF NOT EXISTS "ramUsagePercent" numeric(5, 2);

ALTER TABLE "cloudNode"
  ADD CONSTRAINT IF NOT EXISTS "cloudNode_cpuUsagePercent_check" 
  CHECK ("cpuUsagePercent" IS NULL OR ("cpuUsagePercent" >= 0 AND "cpuUsagePercent" <= 100));

ALTER TABLE "cloudNode"
  ADD CONSTRAINT IF NOT EXISTS "cloudNode_ramUsagePercent_check" 
  CHECK ("ramUsagePercent" IS NULL OR ("ramUsagePercent" >= 0 AND "ramUsagePercent" <= 100));

