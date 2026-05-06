import { PageLayout } from "@/components/layout/page-layout";
import { getCurrentUserFromSession, getUserDataForDashboard } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserFromSession();
  if (!user) {
    const cookieStore = await cookies();
    const hasSessionCookie =
      cookieStore.get("session") ||
      cookieStore.get("next-auth.session-token") ||
      cookieStore.get("__Secure-next-auth.session-token");

    if (hasSessionCookie) {
      redirect("/sign-in?clear_session=true");
    }
    redirect("/sign-in");
  }

  const initialUserData = await getUserDataForDashboard(user.id);

  return <PageLayout user={user} initialUserData={initialUserData}>{children}</PageLayout>;
}
