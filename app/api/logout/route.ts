import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookiesToDelete = [
    "session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
  ];

  const isProduction = process.env.NODE_ENV === "production";

  for (const cookieName of cookiesToDelete) {
    response.cookies.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });
  }

  return response;
}
