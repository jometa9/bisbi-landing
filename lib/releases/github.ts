import { getAppSettings } from "@/lib/db/queries";

export async function getLatestBisbiAssetUrl(): Promise<string | null> {
  const settings = await getAppSettings();
  return settings.bisbiMacDownloadUrl?.trim() || null;
}
