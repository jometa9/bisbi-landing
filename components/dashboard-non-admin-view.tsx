"use client";

import { logoutAction } from "@/app/(login)/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function DashboardNonAdminView() {
  async function handleLogout() {
    await logoutAction();
    await signOut({ callbackUrl: "/sign-in" });
  }

  return (
    <div className="space-y-3 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          We&apos;re working on it
        </h2>
        <p className="text-xl text-gray-400">
          The dashboard is not available for your account yet.
        </p>
      </div>
      <p className="text-sm text-gray-600">
        We are building something new. Check back later or return to the home
        page.
      </p>
      <Button
        asChild
        className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
      >
        <Link href="/">Go to home</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        className="w-full justify-center rounded-lg border border-gray-300 py-3 text-md text-gray-700 hover:bg-gray-50"
      >
        Log out
      </Button>
      <p className="text-sm text-gray-600">
        Click the button above to return to the home page.
      </p>
    </div>
  );
}
