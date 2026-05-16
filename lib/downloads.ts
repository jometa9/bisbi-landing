/**
 * Bisbi download links.
 *
 * Edit the URLs below when you publish a new release. These are read on the
 * client to point download buttons to the right asset per OS.
 */

export type DownloadOS = "mac" | "windows";

export const DOWNLOADS: Record<DownloadOS, string> = {
  mac: "https://github.com/jometa9/Bisbi/releases/latest/download/Bisbi.dmg",
  windows: "https://github.com/jometa9/Bisbi/releases/latest/download/Bisbi-Setup.exe",
};

export const SOURCE_REPO_URL = "https://github.com/jometa9/Bisbi";

export function detectOS(): DownloadOS | null {
  if (typeof window === "undefined") return null;
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || "").toLowerCase();
  if (platform.includes("mac") || ua.includes("mac os") || ua.includes("macintosh")) {
    return "mac";
  }
  if (platform.includes("win") || ua.includes("windows")) {
    return "windows";
  }
  return null;
}
