import { getCurrentUserFromSession } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AISettingsRedirect() {
  const user = await getCurrentUserFromSession();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/dashboard");
  redirect("/dashboard/admin/settings");
}
