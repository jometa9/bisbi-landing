import { getUser } from "@/lib/db/queries";
import { getSession } from "./session";

export async function getUserAuth() {
  const session = await getSession();
  const user = await getUser();

  return {
    session,
    user,
  };
}

export async function isAdminRequest(): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session) {
      return false;
    }

    const user = await getUser();

    if (!user) {
      return false;
    }

    const isAdmin = user.role === "admin";

    return isAdmin;
  } catch (error) {
    console.error("Error checking admin request:", error);
    return false;
  }
}
