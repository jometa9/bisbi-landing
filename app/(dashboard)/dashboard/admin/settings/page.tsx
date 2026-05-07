import { AdminSection } from "@/components/admin/admin-section";
import AdminSubscriptionLimits from "@/components/admin-subscription-limits";
import AdminDeleteUser from "@/components/admin-delete-user";
import AdminSettings from "@/components/admin-settings";
import AdminInboxSettings from "@/components/admin-inbox-settings";
import AdminStripeSettings from "@/components/admin-stripe-settings";
import AdminIntegrationsSettings from "@/components/admin-integrations-settings";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import {
  CreditCard,
  Download,
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
    <div className="px-6 w-full pb-20 pt-1">
      <div className="w-full space-y-3">
        <div className="space-y-6">
          <AdminSection
            titleKey="sectionAssignSubscription"
            icon={<Gift className="h-5 w-5 text-gray-700" />}
          >
            <AdminSettings />
          </AdminSection>

          <AdminSection
            titleKey="sectionLimits"
            icon={<Sliders className="h-5 w-5 text-gray-700" />}
          >
            <AdminSubscriptionLimits />
          </AdminSection>

          <AdminSection
            titleKey="sectionEmailInbox"
            icon={<Mail className="h-5 w-5 text-gray-700" />}
          >
            <AdminInboxSettings />
          </AdminSection>

          <AdminSection
            titleKey="sectionStripe"
            icon={<CreditCard className="h-5 w-5 text-gray-700" />}
          >
            <AdminStripeSettings />
          </AdminSection>

          <AdminSection
            titleKey="sectionDownloads"
            icon={<Download className="h-5 w-5 text-gray-700" />}
          >
            <AdminIntegrationsSettings />
          </AdminSection>

          <AdminSection
            titleKey="sectionDeleteUser"
            icon={<Trash2 className="h-5 w-5 text-gray-700" />}
          >
            <AdminDeleteUser />
          </AdminSection>
        </div>
      </div>
    </div>
  );
}
