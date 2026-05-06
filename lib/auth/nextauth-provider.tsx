"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

interface NextAuthProviderProps extends PropsWithChildren {
  session?: Session | null;
}

export function NextAuthProvider({ children, session }: NextAuthProviderProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
