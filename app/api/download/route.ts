import { getDownloadInfo } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

function inferOSFromUserAgent(request: NextRequest): "windows" | "mac" {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  return ua.includes("mac") ? "mac" : "windows";
}

export async function GET(request: NextRequest) {
  try {
    const osParam = request.nextUrl.searchParams.get("os")?.toLowerCase();
    const os: "windows" | "mac" =
      osParam === "windows" || osParam === "mac"
        ? osParam
        : inferOSFromUserAgent(request);

    const { downloadUrl } = await getDownloadInfo("multi", os);

    if (!downloadUrl?.trim()) {
      return NextResponse.json(
        { error: "Download is not configured for this platform. Please try again later or contact support." },
        { status: 503 }
      );
    }

    return NextResponse.redirect(downloadUrl, 302);
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve download URL" },
      { status: 500 }
    );
  }
}
