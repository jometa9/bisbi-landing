"use client";

import { logoutAction } from "@/app/(login)/actions";
import { useSidebar } from "@/contexts/sidebar-context";
import { User } from "@/lib/db/schema";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface DashboardHeaderProps {
  user?: User;
  showSidebar?: boolean;
}

export function DashboardHeader({
  user,
  showSidebar = true,
}: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const isWeb = source !== "app";
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await logoutAction();
    await signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <header>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              {showSidebar && user && (
                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-gray-800 transition-colors min-[600px]:hidden"
                  aria-label="Toggle menu"
                >
                  {isSidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              )}
              <span className="text-xl font-bold tracking-tight text-foreground">
                IPTRADE
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isWeb && user && (
                <span className="hidden md:block text-sm text-gray-400">
                  {user.name || user.email?.split("@")[0]}
                </span>
              )}
              <div
                className="flex items-center gap-3 px-1 py-0.5 pr-0 text-sm text-gray-400 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
