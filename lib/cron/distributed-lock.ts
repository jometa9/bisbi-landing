import { db } from "@/lib/db";
import { cronLock } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

function getInstanceId(): string {
  const host =
    process.env.HOSTNAME ||
    process.env.VERCEL_REGION ||
    process.env.FLY_MACHINE_ID ||
    "unknown";
  return `${host}:${process.pid}`;
}

export interface LockResult<T> {
  success: boolean;
  executed: boolean;
  data?: T;
  error?: string;
  skippedReason?: string;
}

export interface ExecuteWithLockOptions {
  timeout?: number;
  skipIfRecentlyRun?: number;
}

async function ensureLockRow(jobName: string, lockKey: number): Promise<void> {
  await db
    .insert(cronLock)
    .values({ jobName, lockKey })
    .onConflictDoNothing({ target: cronLock.jobName });
}

export async function executeWithLock<T>(
  jobName: string,
  lockKey: number,
  fn: () => Promise<T>,
  options: ExecuteWithLockOptions = {}
): Promise<LockResult<T>> {
  const instanceId = getInstanceId();
  const startTime = Date.now();
  const timeout = options.timeout || 5 * 60 * 1000;

  try {
    await ensureLockRow(jobName, lockKey);

    if (options.skipIfRecentlyRun) {
      const [lockInfo] = await db
        .select()
        .from(cronLock)
        .where(eq(cronLock.jobName, jobName))
        .limit(1);

      if (lockInfo?.lastRunAt) {
        const timeSinceLastRun = Date.now() - lockInfo.lastRunAt.getTime();
        if (timeSinceLastRun < options.skipIfRecentlyRun) {
          return {
            success: true,
            executed: false,
            skippedReason: `Recently run ${Math.round(
              timeSinceLastRun / 1000
            )}s ago`,
          };
        }
      }
    }

    const acquireRows = await db.execute<{ acquired: boolean }>(
      sql`SELECT pg_try_advisory_lock(${lockKey}) as acquired`
    );
    const acquired = acquireRows[0]?.acquired === true;

    if (!acquired) {
      return {
        success: true,
        executed: false,
        skippedReason: "Another instance is running this job",
      };
    }

    await db
      .update(cronLock)
      .set({
        lastRunAt: new Date(),
        lastRunBy: instanceId,
        lastRunStatus: "running",
        lastRunError: null,
        updatedAt: new Date(),
      })
      .where(eq(cronLock.jobName, jobName));

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Job timeout after ${timeout}ms`)),
            timeout
          )
        ),
      ]);

      const duration = Date.now() - startTime;
      await db
        .update(cronLock)
        .set({
          lastRunStatus: "success",
          lastRunDurationMs: duration,
          lastRunError: null,
          updatedAt: new Date(),
        })
        .where(eq(cronLock.jobName, jobName));

      return { success: true, executed: true, data: result };
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      await db
        .update(cronLock)
        .set({
          lastRunStatus: "failed",
          lastRunDurationMs: duration,
          lastRunError: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(cronLock.jobName, jobName));

      console.error(
        `[DistributedLock] ${jobName} - Failed after ${duration}ms:`,
        errorMessage
      );

      return { success: false, executed: true, error: errorMessage };
    } finally {
      try {
        await db.execute(sql`SELECT pg_advisory_unlock(${lockKey})`);
      } catch (unlockError) {
        console.error(
          `[DistributedLock] ${jobName} - Error releasing lock:`,
          unlockError
        );
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[DistributedLock] ${jobName} - Fatal error:`, errorMessage);
    return { success: false, executed: false, error: errorMessage };
  }
}

export async function getLockStatus(jobName: string) {
  const [lock] = await db
    .select()
    .from(cronLock)
    .where(eq(cronLock.jobName, jobName))
    .limit(1);
  return lock;
}

export async function getAllLockStatuses() {
  return await db.select().from(cronLock);
}

export async function forceReleaseAllLocks() {
  try {
    await db.execute(sql`SELECT pg_advisory_unlock_all()`);
    return true;
  } catch (err) {
    console.error("[DistributedLock] Error releasing locks:", err);
    return false;
  }
}
