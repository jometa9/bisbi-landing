import {
  extractClientInfo,
  extractFacebookCookies,
  trackLead,
} from "@/lib/meta";
import { getLatestBisbiAssetUrl } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const os = searchParams.get("os") as "windows" | "mac" | "linux" | null;
    const metaEventId = searchParams.get("metaEventId") ?? undefined;

    if (os === "windows" || os === "mac" || os === "linux") {
      const downloadUrl = await getLatestBisbiAssetUrl(os);

      try {
        const { fbc, fbp } = extractFacebookCookies(request);
        const { clientIpAddress, clientUserAgent } = extractClientInfo(request);
        await trackLead({
          contentName: `Bisbi Download`,
          contentCategory: "app_download",
          eventSourceUrl: request.url,
          eventId: metaEventId,
          clientIpAddress,
          clientUserAgent,
          fbc,
          fbp,
        });
      } catch (metaError) {
        console.error("[Download] Meta Conversions API Lead:", metaError);
      }

      return NextResponse.json({
        productKey: "bisbi",
        os,
        downloadUrl: downloadUrl || "",
      });
    }

    const [windowsUrl, macUrl, linuxUrl] = await Promise.all([
      getLatestBisbiAssetUrl("windows"),
      getLatestBisbiAssetUrl("mac"),
      getLatestBisbiAssetUrl("linux"),
    ]);

    return NextResponse.json({
      bisbi: {
        windows: { downloadUrl: windowsUrl || "" },
        mac: { downloadUrl: macUrl || "" },
        linux: { downloadUrl: linuxUrl || "" },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
