"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { getInboxConfig } from "@/lib/email/inbox-config";
import { lt, sql } from "drizzle-orm";
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

    if (currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden - superadmin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const retentionDays = body.retentionDays ?? null;

    if (retentionDays === null) {
      return NextResponse.json({
        success: true,
        message: "Retention is set to indefinite - no emails purged",
        retentionDays: null,
        emailsDeleted: 0,
        attachmentsDeleted: 0,
      });
    }
    const dryRun = body.dryRun === true;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [{ count: emailCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(inboundEmail)
      .where(lt(inboundEmail.receivedAt, cutoffDate));

    const emailsToPurge = await db
      .select({ attachments: inboundEmail.attachments })
      .from(inboundEmail)
      .where(lt(inboundEmail.receivedAt, cutoffDate));
    
    let attachmentCount = 0;
    for (const email of emailsToPurge) {
      if (Array.isArray(email.attachments)) {
        attachmentCount += email.attachments.length;
      }
    }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        emailsToDelete: Number(emailCount),
        attachmentsToDelete: attachmentCount,
      });
    }

    await db
      .delete(inboundEmail)
      .where(lt(inboundEmail.receivedAt, cutoffDate));

    return NextResponse.json({
      success: true,
      retentionDays,
      cutoffDate: cutoffDate.toISOString(),
      emailsDeleted: Number(emailCount),
      attachmentsDeleted: Number(attachmentCount),
    });
  } catch (error) {
    console.error("[Admin Inbox Purge] Error:", error);
    return NextResponse.json(
      { error: "Failed to purge emails" },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    const inboxConfig = await getInboxConfig();

    return NextResponse.json({
      retentionDays: null,
      retentionPolicy: "indefinite",
      webhookConfigured: !!inboxConfig.webhookSecret,
      emailsEligibleForPurge: 0,
    });
  } catch (error) {
    console.error("[Admin Inbox Purge] Error:", error);
    return NextResponse.json(
      { error: "Failed to get retention info" },
      { status: 500 }
    );
  }
}
