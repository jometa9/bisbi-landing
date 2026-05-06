"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/drizzle";
import { getUserById } from "@/lib/db/queries";
import { inboundEmail } from "@/lib/db/schema";
import { and, desc, ilike, isNull, or, sql, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "receivedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(inboundEmail.mailFrom, `%${search}%`),
          ilike(inboundEmail.subject, `%${search}%`)
        )
      );
    }

    if (status === "read") {
      conditions.push(sql`${inboundEmail.readAt} IS NOT NULL`);
      conditions.push(isNull(inboundEmail.archivedAt));
    } else if (status === "unread") {
      conditions.push(isNull(inboundEmail.readAt));
      conditions.push(isNull(inboundEmail.archivedAt));
    } else if (status === "archived") {
      conditions.push(sql`${inboundEmail.archivedAt} IS NOT NULL`);
    } else {
      conditions.push(isNull(inboundEmail.archivedAt));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(inboundEmail)
      .where(whereClause);

    const emails = await db
      .select({
        id: inboundEmail.id,
        resendEmailId: inboundEmail.resendEmailId,
        mailFrom: inboundEmail.mailFrom,
        rcptTo: inboundEmail.rcptTo,
        subject: inboundEmail.subject,
        status: inboundEmail.status,
        readAt: inboundEmail.readAt,
        archivedAt: inboundEmail.archivedAt,
        receivedAt: inboundEmail.receivedAt,
        createdAt: inboundEmail.createdAt,
        attachmentCount: sql<number>`(
          CASE 
            WHEN ${inboundEmail.attachments} IS NULL THEN 0
            ELSE jsonb_array_length(${inboundEmail.attachments})
          END
        )`.as("attachmentCount"),
      })
      .from(inboundEmail)
      .where(whereClause)
      .orderBy(
        sql`CASE WHEN ${inboundEmail.readAt} IS NULL THEN 0 ELSE 1 END`,
        sortOrder === "asc"
          ? sql`${sql.identifier(sortBy)} ASC`
          : desc(inboundEmail.receivedAt)
      )
      .limit(limit)
      .offset(offset);

    const [stats] = await db
      .select({
        total: count(),
        unread: sql<number>`COUNT(*) FILTER (WHERE ${inboundEmail.readAt} IS NULL AND ${inboundEmail.archivedAt} IS NULL)`,
        read: sql<number>`COUNT(*) FILTER (WHERE ${inboundEmail.readAt} IS NOT NULL AND ${inboundEmail.archivedAt} IS NULL)`,
        archived: sql<number>`COUNT(*) FILTER (WHERE ${inboundEmail.archivedAt} IS NOT NULL)`,
      })
      .from(inboundEmail);

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: stats.total,
        unread: Number(stats.unread),
        read: Number(stats.read),
        archived: Number(stats.archived),
      },
    });
  } catch (error) {
    console.error("[Admin Inbox] Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

