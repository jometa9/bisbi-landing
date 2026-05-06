"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import {
  user,
  accounts,
  appSettings,
  userProductSubscription,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getUserById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 }
      );
    }

    const userToDelete = userResult[0];

    if (userToDelete.id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    if (
      (userToDelete.role === "admin" || userToDelete.role === "superadmin") &&
      currentUser.role !== "superadmin"
    ) {
      return NextResponse.json(
        { error: "Only superadmin can delete admin accounts" },
        { status: 403 }
      );
    }

    const deletedAccounts = await db
      .delete(accounts)
      .where(eq(accounts.userId, userToDelete.id))
      .returning();

    const deletedSubscriptions = await db
      .delete(userProductSubscription)
      .where(eq(userProductSubscription.userId, userToDelete.id))
      .returning();

    await db
      .update(appSettings)
      .set({ updatedBy: null })
      .where(eq(appSettings.updatedBy, userToDelete.id));

    await db.delete(user).where(eq(user.id, userToDelete.id));

    return NextResponse.json({
      success: true,
      message: `User ${email} and all related data have been permanently deleted.`,
      deletedEmail: email,
      accountsDeleted: deletedAccounts.length,
      subscriptionsDeleted: deletedSubscriptions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
