"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { getEmailConfig, getResendClient } from "@/lib/email/config";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { subject, message, html, attachments } = body;

    if (!message && !html) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const [email] = await db
      .select()
      .from(inboundEmail)
      .where(eq(inboundEmail.id, id))
      .limit(1);

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const emailConfig = await getEmailConfig();
    const resendInstance = await getResendClient();
    
    if (!resendInstance || !emailConfig.apiKey) {
      return NextResponse.json(
        { error: "Email service not configured. Please configure Resend API key in settings." },
        { status: 500 }
      );
    }

    const rcptTo = email.rcptTo as string[];
    const fromAddress = rcptTo[0] || emailConfig.emailFrom;
    const toAddress = email.mailFrom;
    const originalSubject = email.subject || "(No Subject)";
    const replySubject = subject || (
      originalSubject.toLowerCase().startsWith("re:")
        ? originalSubject
        : `Re: ${originalSubject}`
    );

    const replyHeaders: Record<string, string> = {};
    if (email.messageId) {
      replyHeaders["In-Reply-To"] = email.messageId;
      replyHeaders["References"] = email.messageId;
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

    const { data, error } = await resendInstance.emails.send({
      from: fromAddress,
      to: toAddress,
      subject: replySubject,
      text: message || "",
      html: html || `<p>${(message || "").replace(/\n/g, "<br>")}</p>`,
      headers: replyHeaders,
      ...(resendAttachments && resendAttachments.length > 0 && { attachments: resendAttachments }),
    });

    if (error) {
      console.error("[Admin Inbox Reply] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send reply", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      from: fromAddress,
      to: toAddress,
      subject: replySubject,
    });
  } catch (error) {
    console.error("[Admin Inbox Reply] Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}

