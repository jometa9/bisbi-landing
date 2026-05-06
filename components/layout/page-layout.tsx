"use client";

import { UserDataProvider, UserData } from "@/contexts/user-data-context";
import { User } from "@/lib/db/schema";
import { Suspense } from "react";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  user: User;
  initialUserData?: UserData | null;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function PageLayout({
  children,
  user,
  initialUserData,
  showSidebar = true,
  showHeader = true,
}: PageLayoutProps) {
  return (
    <UserDataProvider user={user} initialData={initialUserData}>
      <div className="flex min-h-screen flex-col">
        {showHeader && (
          <Suspense fallback={null}>
            <DashboardHeader user={user} showSidebar={showSidebar} />
          </Suspense>
        )}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto flex flex-1">
            {showSidebar && (
              <aside className="hidden min-[600px]:block w-40 flex-shrink-0">
                <Sidebar user={user} variant="desktop" />
              </aside>
            )}
            {showSidebar && (
              <div className="min-[600px]:hidden">
                <Sidebar user={user} variant="mobile" />
              </div>
            )}
            <main className="flex-1 overflow-y-auto w-full">{children}</main>
          </div>
        </div>
      </div>
    </UserDataProvider>
  );
}
