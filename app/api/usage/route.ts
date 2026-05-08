import {
  addUserMonthlyUsage,
  currentMonthKey,
  getAppSettings,
  getBisbiFreeMonthlyWordLimit,
  getSubscriptionTier,
  getUserByApiKey,
  getUserMonthlyUsage,
  getUserProductSubscription,
  isActiveSubscription,
  tryClaimBatch,
} from "@/lib/db/queries";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { releaseInfoFromSettings } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "usage:write",
    windowMs: 60_000,
    max: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body ?? {}) as {
    words?: unknown;
    audioSeconds?: unknown;
    transcriptionsCount?: unknown;
    batchId?: unknown;
  };
  const words = Number(raw.words);
  const audioSeconds = Number(raw.audioSeconds);

  if (!Number.isFinite(words) || words < 0 || words > 1_000_000) {
    return NextResponse.json(
      { error: "Invalid 'words' value" },
      { status: 400 }
    );
  }
  if (
    !Number.isFinite(audioSeconds) ||
    audioSeconds < 0 ||
    audioSeconds > 86_400
  ) {
    return NextResponse.json(
      { error: "Invalid 'audioSeconds' value" },
      { status: 400 }
    );
  }

  const rawCount = Number(raw.transcriptionsCount);
  const transcriptionsCount =
    Number.isFinite(rawCount) && rawCount > 0 && rawCount <= 10_000
      ? Math.floor(rawCount)
      : 1;

  const batchId =
    typeof raw.batchId === "string" && raw.batchId.length > 0 && raw.batchId.length <= 64
      ? raw.batchId
      : null;

  const monthKey = currentMonthKey();
  const [existing, settings, sub] = await Promise.all([
    getUserMonthlyUsage(foundUser.id, "bisbi", monthKey),
    getAppSettings(),
    getUserProductSubscription(foundUser.id, "bisbi"),
  ]);

  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const effectiveTier = active ? tier : "free";
  const wordsLimit = getBisbiFreeMonthlyWordLimit(settings);
  const isFree = effectiveTier === "free";
  const currentWords = existing?.wordsUsed ?? 0;

  if (isFree && currentWords >= wordsLimit) {
    return NextResponse.json(
      {
        ok: false,
        error: "Monthly word limit exceeded",
        tier: effectiveTier,
        monthKey,
        wordsUsed: currentWords,
        wordsLimit,
        exceeded: true,
        remaining: 0,
        release: releaseInfoFromSettings(settings),
      },
      { status: 429 }
    );
  }

  // Idempotency: if a batchId was sent and we've already processed it within
  // the TTL window, return the current state without re-incrementing. Lets the
  // client safely retry batches whose response was lost.
  if (batchId) {
    const claimed = await tryClaimBatch(batchId, foundUser.id, "bisbi");
    if (!claimed) {
      const wordsUsedNow = existing?.wordsUsed ?? 0;
      const audioSecondsNow = existing?.audioSeconds ?? 0;
      const transcriptionsCountNow = existing?.transcriptionsCount ?? 0;
      const exceededNow = isFree && wordsUsedNow >= wordsLimit;
      return NextResponse.json({
        ok: true,
        deduped: true,
        tier: effectiveTier,
        monthKey,
        wordsUsed: wordsUsedNow,
        audioSeconds: audioSecondsNow,
        transcriptionsCount: transcriptionsCountNow,
        wordsLimit: isFree ? wordsLimit : null,
        exceeded: exceededNow,
        remaining: isFree ? Math.max(0, wordsLimit - wordsUsedNow) : null,
        release: releaseInfoFromSettings(settings),
      });
    }
  }

  const updated = await addUserMonthlyUsage(foundUser.id, "bisbi", {
    words: Math.floor(words),
    audioSeconds: Math.floor(audioSeconds),
    transcriptionsCount,
  });

  const exceeded = isFree && updated.wordsUsed >= wordsLimit;
  const remaining = isFree
    ? Math.max(0, wordsLimit - updated.wordsUsed)
    : null;

  return NextResponse.json({
    ok: true,
    tier: effectiveTier,
    monthKey: updated.monthKey,
    wordsUsed: updated.wordsUsed,
    audioSeconds: updated.audioSeconds,
    transcriptionsCount: updated.transcriptionsCount,
    wordsLimit: isFree ? wordsLimit : null,
    exceeded,
    remaining,
    release: releaseInfoFromSettings(settings),
  });
}

export async function GET(request: NextRequest) {
  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "usage:read",
    windowMs: 60_000,
    max: 30,
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const authHeader = request.headers.get("authorization");
  const apiKey =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const foundUser = await getUserByApiKey(apiKey);
  if (!foundUser) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const monthKey = currentMonthKey();
  const [usage, settings, sub] = await Promise.all([
    getUserMonthlyUsage(foundUser.id, "bisbi", monthKey),
    getAppSettings(),
    getUserProductSubscription(foundUser.id, "bisbi"),
  ]);

  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const effectiveTier = active ? tier : "free";

  const wordsUsed = usage?.wordsUsed ?? 0;
  const audioSeconds = usage?.audioSeconds ?? 0;
  const transcriptionsCount = usage?.transcriptionsCount ?? 0;
  const wordsLimit = getBisbiFreeMonthlyWordLimit(settings);
  const isFree = effectiveTier === "free";
  const exceeded = isFree && wordsUsed >= wordsLimit;

  return NextResponse.json({
    ok: true,
    tier: effectiveTier,
    monthKey,
    wordsUsed,
    audioSeconds,
    transcriptionsCount,
    wordsLimit: isFree ? wordsLimit : null,
    exceeded,
    remaining: isFree ? Math.max(0, wordsLimit - wordsUsed) : null,
    release: releaseInfoFromSettings(settings),
  });
}
