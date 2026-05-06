import { AuthHeader } from "@/components/layout/auth-header";
import { NextAuthProvider } from "@/lib/auth/nextauth-provider";
import { I18nProvider } from "@/lib/i18n";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <I18nProvider>
      <div className="min-h-screen" style={{ backgroundColor: "#F0EDE6", color: "#1A1A18" }}>
        <AuthHeader />
        <div className="flex min-h-screen flex-col items-center justify-center px-3 py-12 pt-28">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      </I18nProvider>
    </NextAuthProvider>
  );
}
