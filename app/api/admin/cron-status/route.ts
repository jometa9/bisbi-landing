import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAllLockStatuses } from "@/lib/cron/distributed-lock";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin only" },
      { status: 403 }
    );
  }

  try {
    const jobs = await getAllLockStatuses();
    return NextResponse.json({ success: true, jobs });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
