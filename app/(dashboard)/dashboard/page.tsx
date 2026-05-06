"use client";

import { DashboardBrandFooter } from "@/components/dashboard-brand-footer";
import { DashboardProductsOverview } from "@/components/dashboard-products-overview";
import { useUserData } from "@/contexts/user-data-context";

export default function DashboardPage() {
  const { data } = useUserData();

  const userName = data?.name || data?.email?.split("@")[0] || "there";

  return (
    <div className="px-3 w-full pb-20">
      <div className="w-full  space-y-3">
        <div>
          <h1 className="text-2xl">Welcome back, {userName}</h1>
          <p className="text-gray-600 text-sm mt-1">
            Your complete trading infrastructure, one click away
          </p>
        </div>

        <DashboardProductsOverview />

        <DashboardBrandFooter />
      </div>
    </div>
  );
}
