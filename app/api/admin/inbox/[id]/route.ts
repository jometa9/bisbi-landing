"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const attachments = Array.isArray(email.attachments) 
      ? email.attachments.map((att: any, index: number) => ({
          id: att.id ? `${id}:${att.id}` : `${id}:${index}`,
          filename: att.filename || "unknown",
          contentType: att.contentType || null,
          sizeBytes: att.sizeBytes || null,
          contentId: att.contentId || null,
          contentDisposition: att.contentDisposition || null,
          hasContent: !!att.downloadUrl,
          storageUrl: att.downloadUrl || null,
        }))
      : [];

    if (!email.readAt) {
      await db
        .update(inboundEmail)
        .set({ readAt: new Date(), updatedAt: new Date() })
        .where(eq(inboundEmail.id, id));
    }

    return NextResponse.json({
      email: {
        ...email,
        rawWebhookPayload: undefined,
        rawEmailContent: undefined,
      },
      attachments,
    });
  } catch (error) {
    console.error("[Admin Inbox] Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { action } = body;

    const [email] = await db
      .select({ id: inboundEmail.id })
      .from(inboundEmail)
      .where(eq(inboundEmail.id, id))
      .limit(1);

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const updates: Record<string, Date | null> = { updatedAt: new Date() };

    switch (action) {
      case "markRead":
        updates.readAt = new Date();
        break;
      case "markUnread":
        updates.readAt = null;
        break;
      case "archive":
        updates.archivedAt = new Date();
        break;
      case "unarchive":
        updates.archivedAt = null;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await db
      .update(inboundEmail)
      .set(updates)
      .where(eq(inboundEmail.id, id));

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("[Admin Inbox] Error updating email:", error);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      .select({ id: inboundEmail.id })
      .from(inboundEmail)
      .where(eq(inboundEmail.id, id))
      .limit(1);

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await db
      .delete(inboundEmail)
      .where(eq(inboundEmail.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Inbox] Error deleting email:", error);
    return NextResponse.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}

