import { cookies } from "next/headers";

export async function clearInvalidSession() {
  const cookieStore = cookies();
  
  const authCookies = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token", 
    "__Secure-authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.pkce.code_verifier",
    "__Secure-authjs.pkce.code_verifier"
  ];

  authCookies.forEach(cookieName => {
    cookieStore.delete({
      name: cookieName,
      path: "/",
    });
  });
}
