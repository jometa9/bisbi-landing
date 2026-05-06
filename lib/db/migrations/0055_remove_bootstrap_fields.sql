
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "windowsBootstrapEnabled";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "vpsBootstrapCtrZipUrl";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "vpsBootstrapMtZipUrl";
ALTER TABLE "appSettings" DROP COLUMN IF EXISTS "vpsBootstrapTestExeUrl";

ALTER TABLE "contaboVps" DROP COLUMN IF EXISTS "bootstrapStatus";
ALTER TABLE "contaboVps" DROP COLUMN IF EXISTS "bootstrapExecutedAt";
ALTER TABLE "contaboVps" DROP COLUMN IF EXISTS "bootstrapError";
