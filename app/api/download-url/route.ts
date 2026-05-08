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
    const metaEventId = searchParams.get("metaEventId") ?? undefined;

    const downloadUrl = await getLatestBisbiAssetUrl();

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
      os: "mac",
      downloadUrl: downloadUrl || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
