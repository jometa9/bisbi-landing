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
      <div className="relative min-h-screen" style={{ backgroundColor: "#FFFFFF", color: "#1A1A18", overflow: "clip" }}>
        <div
          className="dashboard-owl-watermark pointer-events-none fixed select-none"
          aria-hidden="true"
        />
        <AuthHeader />
        <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-3 pt-28">
          <div className="relative w-full max-w-5xl">{children}</div>
        </div>
      </div>
      </I18nProvider>
    </NextAuthProvider>
  );
}
