import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/drizzle";
import { accounts, user } from "@/lib/db/schema";
import { compare } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { CustomDrizzleAdapter } from "./custom-drizzle-adapter";
import { createNewUserWithOnboarding } from "./user-onboarding";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = getAppUrl();
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: CustomDrizzleAdapter(),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userResult = await db
          .select()
          .from(user)
          .where(eq(user.email, credentials.email as string))
          .limit(1);

        if (!userResult[0]) {
          return null;
        }

        const passwordMatch = await compare(
          credentials.password as string,
          userResult[0].passwordHash || ""
        );

        if (!passwordMatch) {
          return null;
        }

        const userObj = {
          id: userResult[0].id.toString(),
          email: userResult[0].email,
          name: userResult[0].name,
          role: userResult[0].role,
        };
        return userObj;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async signIn({ user: signInUser, account, profile }) {
      if (account?.provider === "google" && signInUser?.email) {
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, signInUser.email))
          .limit(1);

        if (existingUser.length === 0 && profile?.email) {
          const result = await createNewUserWithOnboarding({
            email: profile.email,
            name: profile.name || null,
            source: "oauth_google",
            profile: {
              given_name: profile.given_name as string | undefined,
              family_name: profile.family_name as string | undefined,
            },
          });

          if (result.success && result.user) {
            await db.insert(accounts).values({
              userId: result.user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });
          }
        } else if (existingUser.length > 0) {
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(
              and(
                eq(accounts.provider, account.provider),
                eq(accounts.providerAccountId, account.providerAccountId)
              )
            )
            .limit(1);

          if (existingAccount.length === 0) {
            await db.insert(accounts).values({
              userId: existingUser[0].id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });
          }
        }

        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/sign-in",
    newUser: "/dashboard",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
});
