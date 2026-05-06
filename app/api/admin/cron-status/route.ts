import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAllLockStatuses } from "@/lib/cron/distributed-lock";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const statuses = await getAllLockStatuses();
    const formatted = statuses.map((status) => ({
      jobName: status.jobName,
      lockKey: status.lockKey,
      lastRunAt: status.lastRunAt?.toISOString() || null,
      lastRunBy: status.lastRunBy,
      lastRunStatus: status.lastRunStatus,
      lastRunDurationMs: status.lastRunDurationMs,
      lastRunError: status.lastRunError,
      timeSinceLastRun: status.lastRunAt
        ? Math.floor((Date.now() - status.lastRunAt.getTime()) / 1000)
        : null,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      jobs: formatted,
    });
  } catch (error) {
    console.error("[Admin] Error fetching cron status:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron status" },
      { status: 500 }
    );
  }
}

