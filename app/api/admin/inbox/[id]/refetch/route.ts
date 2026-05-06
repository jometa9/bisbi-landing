"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { getEmailConfig } from "@/lib/email/config";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function fetchEmailContent(emailId: string) {
  try {
    const config = await getEmailConfig();
    if (!config.apiKey) {
      console.error("[Refetch Email] Resend API key not configured in app settings");
      return null;
    }

    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[Refetch Email] Resend API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        emailId
      });
      
      return null;
    }

    const emailContent = await response.json();
    
    if (!emailContent) {
      return null;
    }

    return emailContent;
  } catch (error) {
    console.error("[Refetch Email] Failed to fetch email content:", error);
    console.error("[Refetch Email] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      emailId
    });
    return null;
  }
}

async function fetchAttachments(emailId: string) {
  try {
    const config = await getEmailConfig();
    if (!config.apiKey) {
      console.error("[Refetch Email] Resend API key not configured in app settings");
      return [];
    }

    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}/attachments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[Refetch Email] Resend API error fetching attachments:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return [];
    }

    const result = await response.json();
    const attachments = result?.data || [];
    return attachments;
  } catch (error) {
    console.error("[Refetch Email] Failed to fetch attachments:", error);
    return [];
  }
}

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

    const [email] = await db
      .select()
      .from(inboundEmail)
      .where(eq(inboundEmail.id, id))
      .limit(1);

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const emailAge = Date.now() - new Date(email.receivedAt).getTime();
    const daysSinceReceived = Math.floor(emailAge / (1000 * 60 * 60 * 24));
    const emailContent = await fetchEmailContent(email.resendEmailId);

    if (!emailContent) {
      const errorMessage = daysSinceReceived > 30
        ? `Email content is no longer available in Resend (email is ${daysSinceReceived} days old). Resend typically retains inbound emails for 30 days.`
        : "Failed to fetch email content from Resend. The email may have been deleted or is no longer available.";
      
      return NextResponse.json(
        { 
          error: errorMessage,
          daysSinceReceived,
          resendEmailId: email.resendEmailId
        },
        { status: 404 }
      );
    }

    const updateData = {
      textBody: emailContent.text || null,
      htmlBody: emailContent.html || null,
      headers: emailContent.headers || null,
      messageId: emailContent.message_id || null,
      rawEmailContent: emailContent,
      status: "complete" as const,
      updatedAt: new Date(),
    };

    await db
      .update(inboundEmail)
      .set(updateData)
      .where(eq(inboundEmail.id, id));

    const attachmentsList = await fetchAttachments(email.resendEmailId);
    
    let attachmentsData: any[] = [];
    if (attachmentsList.length > 0) {
      attachmentsData = attachmentsList.map((attachment) => ({
        id: attachment.id || null,
        filename: attachment.filename || "unknown",
        contentType: attachment.content_type || null,
        sizeBytes: attachment.size || null,
        contentId: attachment.content_id || null,
        contentDisposition: attachment.content_disposition || null,
        downloadUrl: attachment.download_url || null,
        rawMetadata: attachment,
      }));
    }

    await db
      .update(inboundEmail)
      .set({
        attachments: attachmentsData.length > 0 ? attachmentsData : null,
        updatedAt: new Date(),
      })
      .where(eq(inboundEmail.id, id));

    return NextResponse.json({
      success: true,
      message: "Email content refetched successfully",
      htmlLength: updateData.htmlBody?.length || 0,
      textLength: updateData.textBody?.length || 0,
      attachmentsCount: attachmentsList.length,
    });
  } catch (error) {
    console.error("[Refetch Email] Error:", error);
    return NextResponse.json(
      { error: "Failed to refetch email content" },
      { status: 500 }
    );
  }
}

