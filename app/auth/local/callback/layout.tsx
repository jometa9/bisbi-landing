import "@/app/globals.css";
import { AuthHeader } from "@/components/layout/auth-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPTRADE",
};

export default function LocalCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <AuthHeader />
      <div className="flex min-h-screen flex-col items-center justify-center px-3 py-12 pt-28">
        <div className="flex w-full max-w-md flex-col items-stretch">
          {children}
        </div>
      </div>
    </div>
  );
}
