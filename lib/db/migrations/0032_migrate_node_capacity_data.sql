
UPDATE "cloudNode"
SET
  "cpuUsagePercent" = CASE 
    WHEN "lastCapacity"->>'cpuUsagePercent' IS NOT NULL 
    THEN ("lastCapacity"->>'cpuUsagePercent')::numeric(5, 2)
    ELSE NULL
  END,
  "ramUsagePercent" = CASE 
    WHEN "lastCapacity"->>'ramUsagePercent' IS NOT NULL 
    THEN ("lastCapacity"->>'ramUsagePercent')::numeric(5, 2)
    ELSE NULL
  END
WHERE "lastCapacity" IS NOT NULL;

