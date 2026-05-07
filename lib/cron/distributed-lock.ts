import { client } from "@/lib/db";

export interface ExecuteWithLockOptions {
  timeout?: number;
}

export interface ExecuteWithLockResult<T> {
  acquired: boolean;
  result?: T;
  error?: string;
}

export async function executeWithLock<T>(
  name: string,
  lockId: number,
  fn: () => Promise<T>,
  options: ExecuteWithLockOptions = {}
): Promise<ExecuteWithLockResult<T>> {
  const { timeout } = options;

  let acquired = false;
  try {
    const rows = await client<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(${lockId}) AS locked
    `;
    acquired = rows[0]?.locked === true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { acquired: false, error: `Failed to acquire lock ${name}: ${message}` };
  }

  if (!acquired) {
    return { acquired: false };
  }

  try {
    const work = fn();
    const result = timeout && timeout > 0
      ? await Promise.race([
          work,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Lock task '${name}' timed out after ${timeout}ms`)),
              timeout
            )
          ),
        ])
      : await work;
    return { acquired: true, result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { acquired: true, error: message };
  } finally {
    try {
      await client`SELECT pg_advisory_unlock(${lockId})`;
    } catch {
    }
  }
}
