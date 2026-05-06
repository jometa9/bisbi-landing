import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/drizzle";
import { inboundEmail } from "@/lib/db/schema";
import { getEmailConfig } from "@/lib/email/config";
import { getInboxConfig } from "@/lib/email/inbox-config";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

interface ResendEmailReceivedEvent {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    attachments?: Array<{
      filename: string;
      content_type?: string;
      size?: number;
    }>;
    created_at: string;
  };
}

async function verifyWebhook(
  request: NextRequest,
  body: string,
  webhookSecret: string
): Promise<ResendEmailReceivedEvent | null> {
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("[Inbound Webhook] Missing svix headers");
    return null;
  }

  try {
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendEmailReceivedEvent;

    return payload;
  } catch (err) {
    console.error("[Inbound Webhook] Signature verification failed:", err);
    return null;
  }
}

async function fetchEmailContent(emailId: string) {
  try {
    const config = await getEmailConfig();
    if (!config.apiKey) {
      console.error("[Inbound Webhook] Resend API key not configured in app settings");
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
      console.error(`[Inbound Webhook] Resend API error:`, {
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
    console.error("[Inbound Webhook] Failed to fetch email content:", error);
    console.error("[Inbound Webhook] Error details:", {
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
      console.error("[Inbound Webhook] Resend API key not configured in app settings");
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
      console.error(`[Inbound Webhook] Resend API error fetching attachments:`, {
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
    console.error("[Inbound Webhook] Failed to fetch attachments:", error);
    return [];
  }
}

async function sendDiscordNotification(
  discordWebhookUrl: string,
  emailData: {
    id: string;
    from: string;
    to: string[];
    subject: string | null;
    textBody: string | null;
    htmlBody: string | null;
  }
) {
  try {
    const dashboardUrl = `${getAppUrl()}/dashboard/admin/inbox/${emailData.id}`;
    const truncateText = (text: string | null, maxLength: number = 1000) => {
      if (!text) return "*(No content)*";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    let contentPreview = emailData.textBody;
    if (!contentPreview && emailData.htmlBody) {
      contentPreview = emailData.htmlBody.replace(/<[^>]*>/g, "");
    }

    const discordPayload = {
      embeds: [
        {
          title: "New Email Received",
          color: 0x5865f2,
          fields: [
            {
              name: "From",
              value: emailData.from,
              inline: false,
            },
            {
              name: "To",
              value: emailData.to.join(", "),
              inline: false,
            },
            {
              name: "Subject",
              value: emailData.subject || "*(No Subject)*",
              inline: false,
            },
            {
              name: "Content Preview",
              value: truncateText(contentPreview, 1000),
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Inbox Notification",
          },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "View in Dashboard",
              url: dashboardUrl,
            },
          ],
        },
      ],
    };

    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Discord Notification] Failed to send:", {
        status: response.status,
        error: errorText,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Discord Notification] Error sending notification:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const inboxConfig = await getInboxConfig();

    if (!inboxConfig.webhookSecret) {
      console.error("[Inbound Webhook] Webhook secret not configured in app settings");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const event = await verifyWebhook(request, body, inboxConfig.webhookSecret);

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (event.type !== "email.received") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { data } = event;

    // Only accept emails addressed to our app's domain. Resend may deliver
    // events for other domains on the same account, and we don't want those
    // polluting this database.
    const appHost = (() => {
      try {
        return new URL(getAppUrl()).hostname.replace(/^www\./, "").toLowerCase();
      } catch {
        return "";
      }
    })();

    const recipients = [
      ...(data.to || []),
      ...(data.cc || []),
      ...(data.bcc || []),
    ];
    const belongsToAppDomain =
      !!appHost &&
      recipients.some((addr) => {
        const match = addr.match(/@([^>\s]+)/);
        const domain = match?.[1]?.toLowerCase();
        return domain === appHost || domain?.endsWith(`.${appHost}`);
      });

    if (!belongsToAppDomain) {
      console.log(
        `[Inbound Webhook] Ignoring email not addressed to ${appHost}:`,
        recipients
      );
      return NextResponse.json(
        { received: true, ignored: "not-app-domain" },
        { status: 200 }
      );
    }

    const resendEmailId = data.email_id;

    const existing = await db
      .select({ id: inboundEmail.id })
      .from(inboundEmail)
      .where(eq(inboundEmail.resendEmailId, resendEmailId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    const [insertedEmail] = await db
      .insert(inboundEmail)
      .values({
        resendEmailId,
        mailFrom: data.from,
        rcptTo: data.to,
        subject: data.subject || null,
        rawWebhookPayload: JSON.parse(body),
        status: "pending",
        receivedAt: new Date(data.created_at),
      })
      .returning({ id: inboundEmail.id });

    const emailDbId = insertedEmail.id;
    let emailContent = null;
    let fetchStatus: "complete" | "partial" | "failed" = "complete";

    try {
      emailContent = await fetchEmailContent(resendEmailId);

      if (emailContent) {
        const updateData = {
          textBody: emailContent.text || null,
          htmlBody: emailContent.html || null,
          headers: emailContent.headers || null,
          messageId: emailContent.message_id || null,
          rawEmailContent: emailContent,
          updatedAt: new Date(),
        };

        await db
          .update(inboundEmail)
          .set(updateData)
          .where(eq(inboundEmail.id, emailDbId));
      } else {
        fetchStatus = "partial";
      }
    } catch (error) {
      console.error("[Inbound Webhook] Error fetching email content:", error);
      fetchStatus = "partial";
    }

    let attachmentsData: any[] = [];
    if (data.attachments && data.attachments.length > 0) {
      try {
        const attachmentsList = await fetchAttachments(resendEmailId);
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
      } catch (error) {
        console.error("[Inbound Webhook] Error processing attachments:", error);
        fetchStatus = "partial";
      }
    }

    await db
      .update(inboundEmail)
      .set({
        status: fetchStatus,
        attachments: attachmentsData.length > 0 ? attachmentsData : null,
        updatedAt: new Date(),
      })
      .where(eq(inboundEmail.id, emailDbId));

    if (inboxConfig.discordWebhookUrl) {
      await sendDiscordNotification(inboxConfig.discordWebhookUrl, {
        id: emailDbId,
        from: data.from,
        to: data.to,
        subject: data.subject || null,
        textBody: emailContent?.text || null,
        htmlBody: emailContent?.html || null,
      }).catch((error) => {
        console.error("[Inbound Webhook] Discord notification failed, but continuing:", error);
      });
    }

    return NextResponse.json(
      { received: true, emailId: emailDbId, status: fetchStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Inbound Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { status: "Resend inbound webhook endpoint active" },
    { status: 200 }
  );
}
