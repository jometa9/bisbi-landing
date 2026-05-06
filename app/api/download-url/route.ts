import { getDownloadInfo, getAppSettings } from "@/lib/db/queries";
import { ProductKey } from "@/lib/db/schema";
import {
  extractClientInfo,
  extractFacebookCookies,
  trackLead,
} from "@/lib/meta";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productKey = searchParams.get("productKey") as ProductKey | null;
    const os = searchParams.get("os") as "windows" | "mac" | null;
    const metaEventId = searchParams.get("metaEventId") ?? undefined;

    if (productKey === "multi") {
      const osValue = os === "mac" ? "mac" : "windows";
      const downloadInfo = await getDownloadInfo("multi", osValue);

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
        productKey: "multi",
        os: osValue,
        version: downloadInfo.version,
        downloadUrl: downloadInfo.downloadUrl || "",
      });
    }

    if (productKey !== null && productKey !== "") {
      return NextResponse.json(
        { error: "Invalid productKey. Only 'multi' is supported." },
        { status: 400 }
      );
    }

    const settings = await getAppSettings();
    return NextResponse.json({
      multi: {
        windows: {
          version: settings.multiVersion,
          downloadUrl: settings.multiWindowsDownloadUrl || "",
        },
        mac: {
          version: settings.multiVersion,
          downloadUrl: settings.multiMacDownloadUrl || "",
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
