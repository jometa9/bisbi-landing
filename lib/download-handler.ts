import { ProductKey } from "@/lib/db/schema";

export type DownloadOS = "mac" | "windows";

export function getDownloadEventId(): string {
  return `download-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const trackDownloadEvent = (
  productKey: ProductKey,
  eventId: string,
  os: DownloadOS
) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: `Bisbi Download`,
      content_category: "app_download",
      content_ids: [productKey],
      custom_data: { productKey, os },
      eventID: eventId,
    });
  }
};

export const handleDownload = async (
  productKey: ProductKey = "bisbi",
  os: DownloadOS = "mac"
) => {
  try {
    const eventId = getDownloadEventId();

    const response = await fetch(
      `/api/download-url?productKey=${productKey}&os=${os}&metaEventId=${encodeURIComponent(eventId)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch download URL");
    }

    const data = await response.json();
    const downloadUrl = data.downloadUrl;

    if (!downloadUrl) {
      alert("Download link is not configured. Please contact support.");
      return;
    }

    trackDownloadEvent(productKey, eventId, os);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = os === "windows" ? "Bisbi-Setup.exe" : "Bisbi-Setup.dmg";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    alert(
      "Failed to download the installer. Please try again or contact support."
    );
  }
};

export const fetchAllDownloads = async () => {
  try {
    const response = await fetch("/api/download-url");

    if (!response.ok) {
      throw new Error("Failed to fetch download URLs");
    }

    return await response.json();
  } catch {
    return null;
  }
};
