import { getLatestBisbiAssetUrl } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

function inferOSFromUserAgent(
  request: NextRequest
): "windows" | "mac" | "linux" {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "windows";
}

export async function GET(request: NextRequest) {
  try {
    const osParam = request.nextUrl.searchParams.get("os")?.toLowerCase();
    const os: "windows" | "mac" | "linux" =
      osParam === "windows" || osParam === "mac" || osParam === "linux"
        ? osParam
        : inferOSFromUserAgent(request);

    const downloadUrl = await getLatestBisbiAssetUrl(os);

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Download is not available right now. Please try again later." },
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
