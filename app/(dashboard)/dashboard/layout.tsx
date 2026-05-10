import { UserDataProvider } from "@/contexts/user-data-context";
import { getCurrentUserFromSession, getUserDataForDashboard } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
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
        className="relative min-h-screen flex flex-col"
        style={{ backgroundColor: "#FFFFFF", overflow: "clip" }}
      >
        <div
          className="dashboard-owl-watermark pointer-events-none fixed select-none"
          aria-hidden="true"
        />
        <header className="relative" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center cursor-pointer">
              <span
                className="text-3xl font-semibold tracking-tight"
                style={{ color: "#7BA89C" }}
              >
                Bisbi
              </span>
            </Link>

            <SignOutButton />
          </div>
        </header>

        <main className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col pb-5 min-h-[70vh]">
          {children}
        </main>
      </div>
    </UserDataProvider>
  );
}
