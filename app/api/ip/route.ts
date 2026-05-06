import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOOPBACK_IPS = new Set(["::1", "127.0.0.1", "::ffff:127.0.0.1"]);

function isLoopback(ip: string | null): boolean {
  if (!ip) return true;
  return LOOPBACK_IPS.has(ip) || ip.startsWith("127.");
}

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  let ip =
    (forwarded?.split(",")[0]?.trim()) ??
    realIp ??
    null;

  if (isLoopback(ip)) {
    ip = null;
  }

  return NextResponse.json(
    { ip },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
