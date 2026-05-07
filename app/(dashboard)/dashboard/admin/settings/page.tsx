import AdminSubscriptionLimits from "@/components/admin-subscription-limits";
import AdminDeleteUser from "@/components/admin-delete-user";
import AdminSettings from "@/components/admin-settings";
import AdminInboxSettings from "@/components/admin-inbox-settings";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import {
  Gift,
  Mail,
  Sliders,
  Trash2,
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const user = await getCurrentUserFromSession();
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <div className="px-3 w-full pb-20 pt-1">
      <div className="w-full space-y-3">
        <div className="space-y-6">
          <section>
            <div className="group rounded-lg bg-gray-100 p-3 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Gift className="h-5 w-5 text-gray-700" />
                </div>
                <p className="text-lg">Assign Product Subscription</p>
              </div>
              <AdminSettings />
            </div>
          </section>

          <section>
            <div className="group rounded-lg bg-gray-100 p-3 transition-all duration-200 w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Sliders className="h-5 w-5 text-gray-700" />
                </div>
                <p className="text-lg">Subscription Limits</p>
              </div>
              <AdminSubscriptionLimits />
            </div>
          </section>

          <section>
            <div className="group rounded-lg bg-gray-100 p-3 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Mail className="h-5 w-5 text-gray-700" />
                </div>
                <p className="text-lg">Email & Inbox Configuration</p>
              </div>
              <AdminInboxSettings />
            </div>
          </section>

          <section>
            <div className="group rounded-lg bg-gray-100 p-3 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Trash2 className="h-5 w-5 text-gray-700" />
                </div>
                <p className="text-lg">Delete User</p>
              </div>
              <AdminDeleteUser />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
