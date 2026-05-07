const RELEASES_REPO = "jometa9/bisbi-releases";
const CACHE_TTL_MS = 10 * 60 * 1000;

type CachedRelease = {
  fetchedAt: number;
  windowsUrl: string | null;
  macUrl: string | null;
  linuxUrl: string | null;
};

let cache: CachedRelease | null = null;

async function fetchLatestRelease(): Promise<CachedRelease> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bisbi-landing",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`,
    { headers, next: { revalidate: 600 } }
  );
  if (!res.ok) {
    throw new Error(`GitHub releases fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    assets: Array<{ name: string; browser_download_url: string }>;
  };
  const assets = data.assets ?? [];

  const winAsset =
    assets.find((a) => /Bisbi-Setup.*\.exe$/i.test(a.name)) ||
    assets.find((a) => /\.exe$/i.test(a.name));

  const macArm =
    assets.find((a) => /\.dmg$/i.test(a.name) && /arm64/i.test(a.name));
  const macAny =
    macArm ||
    assets.find((a) => /\.dmg$/i.test(a.name) && !/blockmap/i.test(a.name));

  const linuxAsset =
    assets.find((a) => /Bisbi.*\.AppImage$/i.test(a.name)) ||
    assets.find((a) => /\.AppImage$/i.test(a.name));

  return {
    fetchedAt: Date.now(),
    windowsUrl: winAsset?.browser_download_url ?? null,
    macUrl: macAny?.browser_download_url ?? null,
    linuxUrl: linuxAsset?.browser_download_url ?? null,
  };
}

function pickAssetUrl(
  release: CachedRelease,
  os: "windows" | "mac" | "linux"
): string | null {
  if (os === "windows") return release.windowsUrl;
  if (os === "mac") return release.macUrl;
  return release.linuxUrl;
}

export async function getLatestBisbiAssetUrl(
  os: "windows" | "mac" | "linux"
): Promise<string | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return pickAssetUrl(cache, os);
  }
  try {
    cache = await fetchLatestRelease();
    return pickAssetUrl(cache, os);
  } catch (error) {
    console.error("[releases] Failed to fetch latest release:", error);
    if (cache) {
      return pickAssetUrl(cache, os);
    }
    return null;
  }
}
