"use client";

import { logoutAction } from "@/app/(login)/actions";
import { Ghost } from "lucide-react";
import { signOut } from "next-auth/react";

export function DashboardComingSoon() {
  async function handleSignOut() {
    await logoutAction();
    await signOut({ callbackUrl: "/sign-in" });
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-3 max-w-md">
        <Ghost className="w-10 h-10  mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">
         Ups! This is not ready yet
        </h1>
        <p className="text-muted-foreground text-sm">
          We are working on it. Check back later.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center justify-center gap-3 rounded-full bg-gray-900 px-3 py-1 text-base font-semibold text-white hover:bg-gray-700 transition-all cursor-pointer"
        >
          Close session
        </button>
      </div>
    </div>
  );
}
