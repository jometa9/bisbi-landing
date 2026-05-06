import { getUser } from "@/lib/db/queries";
import { runDailyReportJob } from "@/lib/reporting/run-daily-report-job";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
