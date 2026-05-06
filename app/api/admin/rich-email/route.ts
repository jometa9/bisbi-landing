"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { user } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
    const { subject, markdownContent } = data;

    if (!subject || !markdownContent) {
      return NextResponse.json(
        { error: "Subject and markdown content are required" },
        { status: 400 }
      );
    }

    const usersList = await db
      .select()
      .from(user)
      .where(isNull(user.deletedAt));

    if (usersList.length === 0) {
      return NextResponse.json(
        {
          warning: true,
          message: "No users found in the database",
        },
        { status: 200 }
      );
    }

    const { sendRichContentEmail } = await import("@/lib/email/services");

    const batchSize = 10;
    let successCount = 0;
    let failedEmails: string[] = [];

    for (let i = 0; i < usersList.length; i += batchSize) {
      const batch = usersList.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((user) => {
          return sendRichContentEmail({
            email: user.email,
            name: user.name || user.email.split("@")[0],
            subject,
            markdownContent,
          });
        })
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failedEmails.push(batch[index].email);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Rich content emails sent successfully to ${successCount} out of ${usersList.length} users`,
      stats: {
        total: usersList.length,
        success: successCount,
        failed: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send rich content email" },
      { status: 500 }
    );
  }
}
