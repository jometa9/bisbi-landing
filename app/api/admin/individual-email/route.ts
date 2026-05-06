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

    const data = await req.json();
    const { subject, message, recipientEmail } = data;

    if (!subject || !message || !recipientEmail) {
      return NextResponse.json(
        { error: "Subject, message, and recipient email are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { sendBroadcastEmail } = await import("@/lib/email");

    const result = await sendBroadcastEmail({
      email: recipientEmail,
      name: recipientEmail.split("@")[0],
      subject,
      message,
      isImportant: false,
    });

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${recipientEmail}`,
      recipient: recipientEmail,
      result,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send individual email" },
      { status: 500 }
    );
  }
}
