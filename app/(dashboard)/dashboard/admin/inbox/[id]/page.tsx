import { AdminInboxDetail } from "@/components/admin-inbox-detail";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminInboxDetailPage({ params }: Props) {
  const user = await getCurrentUserFromSession();
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <div className="px-3 w-full pb-20 pt-1">
      <div className="w-full space-y-3">
        <AdminInboxDetail emailId={id} />
      </div>
    </div>
  );
}

