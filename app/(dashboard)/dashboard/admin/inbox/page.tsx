import { AdminInboxTable } from "@/components/admin-inbox-table";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminInboxPage() {
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
        <AdminInboxTable />
      </div>
    </div>
  );
}

