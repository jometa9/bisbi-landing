"use server";

import { auth } from "@/lib/auth/config";
import { getUserById } from "@/lib/db/queries";
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

    const formData = await req.formData();
    const csvFile = formData.get("csvFile") as File;
    const subject = formData.get("subject") as string;
    const markdownContent = formData.get("markdownContent") as string;

    if (!csvFile || !subject || !markdownContent) {
      return NextResponse.json(
        { error: "CSV file, subject, and markdown content are required" },
        { status: 400 }
      );
    }

    if (!csvFile.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV file" },
        { status: 400 }
      );
    }

    const csvText = await csvFile.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    const emails: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const line of lines) {
      const email = line.trim();
      if (email && emailRegex.test(email)) {
        emails.push(email);
      }
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses found in CSV file" },
        { status: 400 }
      );
    }

    const uniqueEmails = [...new Set(emails)];
    const { sendRichContentEmail } = await import("@/lib/email/services");

    const batchSize = 10;
    let successCount = 0;
    let failedEmails: string[] = [];

    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((email) => {
          return sendRichContentEmail({
            email,
            name: email.split("@")[0],
            subject,
            markdownContent,
          });
        })
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failedEmails.push(batch[index]);
        }
      });

      if (i + batchSize < uniqueEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `CSV email campaign completed successfully`,
      stats: {
        total: uniqueEmails.length,
        success: successCount,
        failed: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process CSV email campaign",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
