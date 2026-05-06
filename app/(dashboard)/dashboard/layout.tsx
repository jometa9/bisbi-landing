import { UserDataProvider } from "@/contexts/user-data-context";
import { getCurrentUserFromSession, getUserDataForDashboard } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminNav } from "@/components/admin-nav";
import Link from "next/link";

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

  return (
    <UserDataProvider user={user} initialData={initialUserData}>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#F0EDE6" }}
      >
        <header
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{ borderColor: "#EAE6DC", backgroundColor: "#FFFFFF" }}
        >
          <Link href="/" className="flex items-center">
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "#7BA89C" }}
            >
              Bisbi
            </span>
          </Link>

          <SignOutButton />
        </header>

        {(user.role === "admin" || user.role === "superadmin") && <AdminNav />}

        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </UserDataProvider>
  );
}
