
UPDATE "cloudAccount"
SET
  "lotType" = CASE 
    WHEN "copyConfig"->>'lotType' IS NOT NULL 
    THEN ("copyConfig"->>'lotType')::varchar(20)
    ELSE NULL
  END,
  "lotMultiplier" = CASE 
    WHEN "copyConfig"->>'lotMultiplier' IS NOT NULL 
    THEN ("copyConfig"->>'lotMultiplier')::numeric(10, 2)
    ELSE NULL
  END,
  "fixedLot" = CASE 
    WHEN "copyConfig"->>'fixedLot' IS NOT NULL 
    THEN ("copyConfig"->>'fixedLot')::numeric(10, 2)
    ELSE NULL
  END,
  "reverseTrading" = CASE 
    WHEN "copyConfig"->>'reverseTrading' IS NOT NULL 
    THEN ("copyConfig"->>'reverseTrading')::boolean
    ELSE false
  END,
  "prefixEnabled" = CASE 
    WHEN "copyConfig"->'prefix' IS NOT NULL THEN
      CASE 
        WHEN jsonb_typeof("copyConfig"->'prefix') = 'boolean' 
        THEN ("copyConfig"->>'prefix')::boolean
        WHEN jsonb_typeof("copyConfig"->'prefix') = 'object' AND ("copyConfig"->'prefix'->>'enabled') IS NOT NULL
        THEN ("copyConfig"->'prefix'->>'enabled')::boolean
        ELSE false
      END
    WHEN "copyConfig"->>'prefix' IS NOT NULL AND ("copyConfig"->>'prefix')::boolean = true
    THEN true
    ELSE false
  END,
  "prefixValue" = CASE 
    WHEN "copyConfig"->'prefix' IS NOT NULL AND jsonb_typeof("copyConfig"->'prefix') = 'object'
    THEN "copyConfig"->'prefix'->>'value'
    WHEN "copyConfig"->>'prefixValue' IS NOT NULL
    THEN "copyConfig"->>'prefixValue'
    ELSE NULL
  END,
  "prefixAction" = CASE 
    WHEN "copyConfig"->'prefix' IS NOT NULL AND jsonb_typeof("copyConfig"->'prefix') = 'object'
    THEN COALESCE("copyConfig"->'prefix'->>'action', 'add')
    WHEN "copyConfig"->>'prefixType' IS NOT NULL
    THEN "copyConfig"->>'prefixType'
    ELSE NULL
  END,
  "suffixEnabled" = CASE 
    WHEN "copyConfig"->'suffix' IS NOT NULL THEN
      CASE 
        WHEN jsonb_typeof("copyConfig"->'suffix') = 'boolean' 
        THEN ("copyConfig"->>'suffix')::boolean
        WHEN jsonb_typeof("copyConfig"->'suffix') = 'object' AND ("copyConfig"->'suffix'->>'enabled') IS NOT NULL
        THEN ("copyConfig"->'suffix'->>'enabled')::boolean
        ELSE false
      END
    WHEN "copyConfig"->>'suffix' IS NOT NULL AND ("copyConfig"->>'suffix')::boolean = true
    THEN true
    ELSE false
  END,
  "suffixValue" = CASE 
    WHEN "copyConfig"->'suffix' IS NOT NULL AND jsonb_typeof("copyConfig"->'suffix') = 'object'
    THEN "copyConfig"->'suffix'->>'value'
    WHEN "copyConfig"->>'suffixValue' IS NOT NULL
    THEN "copyConfig"->>'suffixValue'
    ELSE NULL
  END,
  "suffixAction" = CASE 
    WHEN "copyConfig"->'suffix' IS NOT NULL AND jsonb_typeof("copyConfig"->'suffix') = 'object'
    THEN COALESCE("copyConfig"->'suffix'->>'action', 'add')
    WHEN "copyConfig"->>'suffixType' IS NOT NULL
    THEN "copyConfig"->>'suffixType'
    ELSE NULL
  END,
  "symbolTranslations" = CASE 
    WHEN "copyConfig"->'symbolTranslations' IS NOT NULL 
    THEN "copyConfig"->'symbolTranslations'
    ELSE NULL
  END
WHERE "copyConfig" IS NOT NULL;

UPDATE "cloudAccount" AS slave
SET "masterTcpUrl" = master."tcpUrl"
FROM "cloudAccount" AS master
WHERE slave."masterAccountId" = master."id"
  AND slave."accountRole" = 'slave'
  AND master."tcpUrl" IS NOT NULL;

