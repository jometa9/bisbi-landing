import { auth } from "@/lib/auth/config";
import { getUserById } from "@/lib/db/queries";
import { runDailyReportJob } from "@/lib/reporting/run-daily-report-job";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST() {
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

  const outcome = await runDailyReportJob();

  if (!outcome.ok) {
    return NextResponse.json(
      { ok: false, error: outcome.error },
      { status: 500 }
    );
  }

  if (outcome.skipped) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: outcome.reason,
    });
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    data: outcome.data,
  });
}
