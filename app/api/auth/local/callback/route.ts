import { getAppUrl } from "@/lib/app-url";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = getAppUrl();
  const callbackPage = `${baseUrl}/auth/local/callback`;

  const params = new URLSearchParams();
  if (code) params.set("code", code);
  if (state) params.set("state", state);
  if (error) params.set("error", error);
  if (errorDescription) params.set("error_description", errorDescription);

  const redirectUrl = params.toString()
    ? `${callbackPage}?${params.toString()}`
    : callbackPage;

  return NextResponse.redirect(redirectUrl);
}
