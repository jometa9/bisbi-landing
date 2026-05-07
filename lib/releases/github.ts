import { getAppSettings } from "@/lib/db/queries";

export async function getLatestBisbiAssetUrl(
  os: "windows" | "mac" | "linux"
): Promise<string | null> {
  const settings = await getAppSettings();
  if (os === "windows") return settings.bisbiWindowsDownloadUrl?.trim() || null;
  if (os === "mac") return settings.bisbiMacDownloadUrl?.trim() || null;
  return settings.bisbiLinuxDownloadUrl?.trim() || null;
}
