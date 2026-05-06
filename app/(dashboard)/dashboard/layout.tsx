import { UserDataProvider } from "@/contexts/user-data-context";
import { getCurrentUserFromSession, getUserDataForDashboard } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminNav } from "@/components/admin-nav";
import Image from "next/image";
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
          style={{ borderColor: "#D9E8E5", backgroundColor: "#F0EDE6" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src="/owl_head.svg" alt="Bisbi" width={22} height={22} />
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: "#1A1A18" }}
            >
              bisbi
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
