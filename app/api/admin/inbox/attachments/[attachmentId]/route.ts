"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
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

    const { attachmentId } = await params;
    const parts = attachmentId.includes(':') ? attachmentId.split(':') : [null, attachmentId];
    const emailId = parts[0];
    const attachmentIdentifier = parts[1];

    let attachment: any = null;
    let email: any = null;

    if (emailId) {
      [email] = await db
        .select()
        .from(inboundEmail)
        .where(eq(inboundEmail.id, emailId))
        .limit(1);

      if (email && Array.isArray(email.attachments)) {
        attachment = email.attachments.find((att: any) => att.id === attachmentIdentifier);
        if (!attachment) {
          const index = parseInt(attachmentIdentifier, 10);
          if (!isNaN(index) && index >= 0 && index < email.attachments.length) {
            attachment = email.attachments[index];
          }
        }
      }
    } else {
      const emails = await db
        .select()
        .from(inboundEmail)
        .limit(100);

      for (const e of emails) {
        if (Array.isArray(e.attachments)) {
          const found = e.attachments.find((att: any) => att.id === attachmentIdentifier);
          if (found) {
            attachment = found;
            email = e;
            break;
          }
        }
      }
    }

    if (!attachment || !email) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    if (attachment.downloadUrl) {
      try {
        const resendResponse = await fetch(attachment.downloadUrl);
        
        if (!resendResponse.ok) {
          throw new Error(`Failed to fetch from Resend: ${resendResponse.status}`);
        }

        const arrayBuffer = await resendResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": attachment.contentType || resendResponse.headers.get("content-type") || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (proxyError) {
        console.error("[Admin Inbox] Error proxying attachment from Resend:", proxyError);
        return NextResponse.json(
          { error: "Failed to fetch attachment from Resend" },
          { status: 500 }
        );
      }
    } else {
      try {
        let base64String = attachment.contentBytes;

        if (typeof base64String !== 'string') {
          base64String = String(base64String);
        }

        if (base64String.includes("base64,")) {
          base64String = base64String.split("base64,")[1] || base64String;
        }

        base64String = base64String.replace(/\s/g, '');

        base64String = base64String
          .split('')
          .map(char => {
            const code = char.charCodeAt(0);
            if (code <= 127 && /[A-Za-z0-9+/=]/.test(char)) {
              return char;
            }
            return '';
          })
          .join('');

        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
          console.error("[Admin Inbox] Invalid base64 string for attachment:", attachmentId);
          console.error("[Admin Inbox] Base64 length:", base64String.length);
          return NextResponse.json(
            { error: "Attachment data is corrupted" },
            { status: 500 }
          );
        }

        const buffer = Buffer.from(base64String, "base64");
        
        if (buffer.length === 0) {
          console.error("[Admin Inbox] Empty buffer after decoding for attachment:", attachmentId);
          return NextResponse.json(
            { error: "Attachment data is empty" },
            { status: 500 }
          );
        }

        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": attachment.contentType || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
            "Content-Length": buffer.length.toString(),
          },
        });
      } catch (decodeError) {
        console.error("[Admin Inbox] Error decoding attachment base64:", decodeError);
        console.error("[Admin Inbox] Attachment ID:", attachmentId);
        console.error("[Admin Inbox] Error details:", decodeError instanceof Error ? decodeError.message : String(decodeError));
        return NextResponse.json(
          { error: "Failed to decode attachment data" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Attachment content not available" },
      { status: 404 }
    );
  } catch (error) {
    console.error("[Admin Inbox] Error downloading attachment:", error);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 }
    );
  }
}

