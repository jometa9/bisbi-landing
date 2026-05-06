import { AuthHeader } from "@/components/layout/auth-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "The page you are looking for does not exist. Return to IPTRADE – local trade copier for MT4, MT5, and cTrader.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <AuthHeader />
      <div className="flex min-h-screen flex-col items-center justify-center px-3 py-12 pt-28">
        <div className="flex w-full max-w-md flex-col items-stretch">
          <div className="space-y-3 pb-20">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Page not found
              </h2>
              <p className="text-xl text-gray-400">
                The page you are looking for does not exist or has been moved.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Please return to the home page.
            </p>
            <Button
              asChild
              className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
            >
              <Link href="/">Go to home</Link>
            </Button>
            <p className="text-sm text-gray-600">
              Click the button above to return to the home page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
