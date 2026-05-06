"use client";

import { UserProvider } from "@/lib/auth";
import { NextAuthProvider } from "@/lib/auth/nextauth-provider";
import { I18nProvider } from "@/lib/i18n";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  userPromise: Promise<unknown>;
}

export function Providers({ children, userPromise }: ProvidersProps) {
  return (
    <NextAuthProvider>
      <UserProvider userPromise={userPromise}>
        <I18nProvider>{children}</I18nProvider>
      </UserProvider>
    </NextAuthProvider>
  );
}
