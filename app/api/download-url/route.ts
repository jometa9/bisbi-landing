import {
  extractClientInfo,
  extractFacebookCookies,
  trackLead,
} from "@/lib/meta";
import { DesktopOS, getLatestBisbiAssetUrl } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

function parseOs(value: string | null): DesktopOS {
  if (value === "windows" || value === "linux") return value;
  return "mac";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metaEventId = searchParams.get("metaEventId") ?? undefined;
    const os = parseOs(searchParams.get("os"));

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
