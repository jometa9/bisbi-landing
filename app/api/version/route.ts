import { getAppSettings } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productKey = searchParams.get("productKey");

    const settings = await getAppSettings();

    if (productKey === "multi") {
      const version = settings.multiVersion;
      return NextResponse.json({
        version,
        success: true,
      });
    }

    if (productKey !== null && productKey !== "") {
      return NextResponse.json(
        { error: "Invalid productKey. Only 'multi' is supported.", success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      versions: {
        multi: {
          version: settings.multiVersion,
        },
      },
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
