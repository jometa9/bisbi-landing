"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { user as users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";

export async function logoutAction() {
  const cookieStore = await cookies();

  const cookiesToDelete = [
    "session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
  ];

  for (const cookieName of cookiesToDelete) {
    cookieStore.delete(cookieName);
  }

  return { success: true };
}

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, currentUser) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, currentUser.id));

    return { success: "Account updated successfully." };
  }
);
