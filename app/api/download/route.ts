import { getLatestBisbiAssetUrl } from "@/lib/releases/github";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const downloadUrl = await getLatestBisbiAssetUrl();

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
