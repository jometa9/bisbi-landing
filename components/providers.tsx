"use client";

import { UserProvider } from "@/lib/auth";
import { NextAuthProvider } from "@/lib/auth/nextauth-provider";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  userPromise: Promise<unknown>;
}

export function Providers({ children, userPromise }: ProvidersProps) {
  return (
    <NextAuthProvider>
      <UserProvider userPromise={userPromise}>{children}</UserProvider>
    </NextAuthProvider>
  );
}
