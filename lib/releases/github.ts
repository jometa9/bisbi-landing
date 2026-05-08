import { getAppSettings } from "@/lib/db/queries";
import type { AppSettings } from "@/lib/db/schema";

export type DesktopOS = "mac" | "windows" | "linux";

export type ReleaseInfo = {
  version: string | null;
  downloadUrls: {
    mac: string | null;
    windows: string | null;
    linux: string | null;
  };
};

export function releaseInfoFromSettings(settings: AppSettings): ReleaseInfo {
  return {
    version: settings.bisbiAppVersion?.trim() || null,
    downloadUrls: {
      mac: settings.bisbiMacDownloadUrl?.trim() || null,
      windows: settings.bisbiWindowsDownloadUrl?.trim() || null,
      linux: settings.bisbiLinuxDownloadUrl?.trim() || null,
    },
  };
}

export async function getReleaseInfo(): Promise<ReleaseInfo> {
  return releaseInfoFromSettings(await getAppSettings());
}

export async function getLatestBisbiAssetUrl(
  os: DesktopOS = "mac"
): Promise<string | null> {
  const { downloadUrls } = await getReleaseInfo();
  return downloadUrls[os];
}
