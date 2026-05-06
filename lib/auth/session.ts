import { auth, SESSION_MAX_AGE_MS } from "@/lib/auth/config";
import { compare, hash } from "bcryptjs";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const key = new TextEncoder().encode(process.env.AUTH_SECRET || "");
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string) {
  return compare(password, hash);
}

export interface SessionData {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
  expires: string;
  [key: string]: unknown;
}

export async function setSession(userData: {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);

  const session: SessionData = {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name || null,
      role: userData.role || "member",
    },
    expires: expires.toISOString(),
  };

  const token = await new SignJWT(session as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);

  (await cookies()).set("session", token, {
    expires,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return session;
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });

  if (
    typeof payload === "object" &&
    payload &&
    "user" in payload &&
    "expires" in payload
  ) {
    return payload as SessionData;
  }

  throw new Error("Invalid token payload");
}

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export const getServerSession = getSession;
