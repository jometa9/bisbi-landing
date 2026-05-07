import { getUserByApiKey, updateUserById } from "@/lib/db/queries";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { generateApiKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "desktop-logout",
    windowMs: 60_000,
    max: 10,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ ok: true, revoked: false });
  }

  await updateUserById(foundUser.id, { apiKey: generateApiKey() });

  return NextResponse.json({ ok: true, revoked: true });
}
