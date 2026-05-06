import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";
import crypto from "crypto";

const CACHE_TTL_MS = 30_000;
let cachedKey: string | null = null;
let cachedAt = 0;

async function loadInternalApiKey(): Promise<string | null> {
  const now = Date.now();
  if (cachedKey !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedKey;
  }

  const [row] = await db
    .select({ internalApiKey: appSettings.internalApiKey })
    .from(appSettings)
    .orderBy(appSettings.id)
    .limit(1);

  cachedKey = row?.internalApiKey || null;
  cachedAt = now;
  return cachedKey;
}

export function clearInternalApiKeyCache() {
  cachedKey = null;
  cachedAt = 0;
}

export type InternalApiAuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function verifyInternalApiKey(
  provided: string | null
): Promise<InternalApiAuthResult> {
  const expected = await loadInternalApiKey();

  if (!expected) {
    return {
      ok: false,
      status: 503,
      error:
        "Internal API key is not configured. An admin must set it in the dashboard.",
    };
  }

  if (!provided) {
    return { ok: false, status: 401, error: "Missing x-internal-api-key header" };
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }
  if (!crypto.timingSafeEqual(a, b)) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  return { ok: true };
}
