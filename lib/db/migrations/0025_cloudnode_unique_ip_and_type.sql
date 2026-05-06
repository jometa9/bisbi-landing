
ALTER TABLE "cloudNode" DROP CONSTRAINT IF EXISTS "cloudNode_publicIp_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "cloudNode_publicIp_apiType_unique" 
ON "cloudNode"("publicIp", "apiType");

