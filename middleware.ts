import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = "/dashboard";
const authRoutes = ["/sign-in"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  const userAgent = request.headers.get("user-agent") || "";
  const isBot =
    /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|applebot|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|pinterestbot|bitrix link preview|XING-contenttabreceiver|Chrome-Lighthouse|telegrambot/i.test(
      userAgent
    );

  if (isBot) {
    return NextResponse.next();
  }


  const sessionCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token") ||
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("session");

  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (pathname.startsWith("/api/auth/") && request.method === "GET") {
    const response = NextResponse.next();

    if (request.headers.get("referer")?.includes("error=")) {
      const authCookies = [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Secure-next-auth.csrf-token",
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "authjs.csrf-token",
        "__Secure-authjs.csrf-token",
        "authjs.pkce.code_verifier",
        "__Secure-authjs.pkce.code_verifier",
      ];

      authCookies.forEach((cookieName) => {
        response.cookies.delete(cookieName);
      });
    }

    return response;
  }

  const source = request.nextUrl.searchParams.get("source");
  const redirect = request.nextUrl.searchParams.get("redirect");
  const isFromApp =
    source === "app" &&
    redirect &&
    redirect.startsWith("bisbi://");

  const shouldClearSession =
    request.nextUrl.searchParams.get("clear_session") === "true";
  if (shouldClearSession && isAuthRoute) {
    const response = NextResponse.next();
    response.cookies.delete("session");
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }

  if (isAuthRoute && sessionCookie && !isFromApp) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

