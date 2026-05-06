
ALTER TABLE "cloudNode"
  ADD COLUMN IF NOT EXISTS "nodeType" varchar(20) NOT NULL DEFAULT 'shared';

ALTER TABLE "cloudNode"
  ADD COLUMN IF NOT EXISTS "userId" uuid REFERENCES "user"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "cloudNode_userId_idx" ON "cloudNode"("userId");

ALTER TABLE "cloudNode"
  ADD CONSTRAINT IF NOT EXISTS "private_node_user_id_check" 
  CHECK (CASE WHEN "nodeType" = 'private' THEN "userId" IS NOT NULL ELSE TRUE END);

