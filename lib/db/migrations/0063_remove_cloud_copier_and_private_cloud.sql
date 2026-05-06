
DELETE FROM "userProductSubscription" 
WHERE "productKey" IN ('cloud_copier', 'private_cloud');

ALTER TABLE "cloudAccount" DROP CONSTRAINT IF EXISTS "cloudAccount_masterAccountId_fkey";
ALTER TABLE "cloudAccount" DROP CONSTRAINT IF EXISTS "cloudAccount_nodeId_fkey";
ALTER TABLE "cloudAccount" DROP CONSTRAINT IF EXISTS "cloudAccount_desiredNodeId_fkey";
ALTER TABLE "pendingNodeAction" DROP CONSTRAINT IF EXISTS "pendingNodeAction_accountId_fkey";
ALTER TABLE "cloudNode" DROP CONSTRAINT IF EXISTS "cloudNode_vpsId_fkey";
ALTER TABLE "cloudNode" DROP CONSTRAINT IF EXISTS "cloudNode_vpsId_contaboVps_id_fk";
ALTER TABLE "cloudNode" DROP CONSTRAINT IF EXISTS "cloudNode_userId_fkey";
ALTER TABLE "appSettings" DROP CONSTRAINT IF EXISTS "appSettings_snapshotVpsId_fkey";
ALTER TABLE "appSettings" DROP CONSTRAINT IF EXISTS "appSettings_snapshotVpsId_contaboVps_id_fk";

DROP INDEX IF EXISTS "cloudAccount_userId_idx";
DROP INDEX IF EXISTS "cloudAccount_serviceType_idx";
DROP INDEX IF EXISTS "cloudAccount_masterAccountId_idx";
DROP INDEX IF EXISTS "cloudAccount_nodeId_idx";
DROP INDEX IF EXISTS "cloudAccount_desiredNodeId_idx";
DROP INDEX IF EXISTS "cloudNode_publicIp_apiType_unique";

DROP TABLE IF EXISTS "pendingNodeAction" CASCADE;
DROP TABLE IF EXISTS "cloudAccount" CASCADE;
DROP TABLE IF EXISTS "cloudNode" CASCADE;
DROP TABLE IF EXISTS "contaboVps" CASCADE;

ALTER TABLE "appSettings" 
  DROP COLUMN IF EXISTS "ctraderClientId",
  DROP COLUMN IF EXISTS "ctraderClientSecret",
  DROP COLUMN IF EXISTS "contaboClientId",
  DROP COLUMN IF EXISTS "contaboClientSecret",
  DROP COLUMN IF EXISTS "contaboUsername",
  DROP COLUMN IF EXISTS "contaboPassword",
  DROP COLUMN IF EXISTS "contaboDefaultProductId",
  DROP COLUMN IF EXISTS "contaboDefaultRegion",
  DROP COLUMN IF EXISTS "contaboAutoScaleEnabled",
  DROP COLUMN IF EXISTS "routerMaxCpuPercent",
  DROP COLUMN IF EXISTS "routerMaxRamPercent",
  DROP COLUMN IF EXISTS "minStandbyServers",
  DROP COLUMN IF EXISTS "snapshotImageId",
  DROP COLUMN IF EXISTS "snapshotVpsId",
  DROP COLUMN IF EXISTS "snapshotLastUpdatedAt",
  DROP COLUMN IF EXISTS "defaultWindowsUser",
  DROP COLUMN IF EXISTS "defaultWindowsPassword";
