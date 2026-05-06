"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { user } from "@/lib/db/schema";
import { getEmailConfig, getResendClient } from "@/lib/email/config";
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

    const body = await req.json();
    const { from, to, subject, content, attachments, sendToAllUsers } = body;

    if (!from || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required fields: from, subject, content" },
        { status: 400 }
      );
    }

    let toList: string[];

    if (sendToAllUsers === true) {
      const users = await db
        .select({ email: user.email })
        .from(user)
        .where(isNull(user.deletedAt));
      toList = users.map((u) => u.email).filter(Boolean);
      if (toList.length === 0) {
        return NextResponse.json(
          { error: "No users found in the database" },
          { status: 400 }
        );
      }
    } else {
      if (!to) {
        return NextResponse.json(
          { error: "Missing required field: to (or use sendToAllUsers)" },
          { status: 400 }
        );
      }
      toList = Array.isArray(to)
        ? to.map((e: unknown) => String(e).trim()).filter(Boolean)
        : String(to)
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
      if (toList.length === 0) {
        return NextResponse.json(
          { error: "At least one valid recipient email is required" },
          { status: 400 }
        );
      }
    }

    const emailConfig = await getEmailConfig();
    const resendInstance = await getResendClient();

    if (!resendInstance || !emailConfig.apiKey) {
      return NextResponse.json(
        { error: "Email service not configured. Please configure Resend API key in settings." },
        { status: 500 }
      );
    }

    const resendAttachments =
      Array.isArray(attachments) && attachments.length > 0
        ? attachments.map(
            (a: { content: string; filename: string }) => ({
              content: a.content,
              filename: a.filename || "attachment",
            })
          )
        : undefined;

    const htmlContent = `<p>${content.replace(/\n/g, "<br>")}</p>`;
    const results: { to: string; messageId?: string; error?: string }[] = [];
    let lastError: unknown = null;

    for (const singleTo of toList) {
      const { data, error } = await resendInstance.emails.send({
        from: from,
        to: singleTo,
        subject: subject,
        text: content,
        html: htmlContent,
        ...(resendAttachments && resendAttachments.length > 0 && { attachments: resendAttachments }),
      });

      if (error) {
        console.error("[Admin Inbox Send] Resend error for", singleTo, error);
        lastError = error;
        results.push({ to: singleTo, error: typeof error === "string" ? error : (error as Error)?.message ?? "Failed to send" });
      } else {
        results.push({ to: singleTo, messageId: data?.id });
      }
    }

    const successCount = results.filter((r) => !r.error).length;
    const failedCount = results.length - successCount;

    if (failedCount === results.length) {
      return NextResponse.json(
        { error: "Failed to send email to any recipient", details: lastError, results },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failedCount,
      results,
      from,
      subject,
    });
  } catch (error) {
    console.error("[Admin Inbox Send] Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

