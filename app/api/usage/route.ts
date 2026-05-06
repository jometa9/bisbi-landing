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
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Called by the Bisbi desktop app after each successful transcription.
// Authorization: Bearer {apiKey}
// Body: { words: number, audioSeconds: number, transcribedAt?: string }
export async function POST(request: NextRequest) {
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

  const raw = (body ?? {}) as { words?: unknown; audioSeconds?: unknown };
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

  const [updated, settings, sub] = await Promise.all([
    addUserMonthlyUsage(foundUser.id, "bisbi", {
      words: Math.floor(words),
      audioSeconds: Math.floor(audioSeconds),
    }),
    getAppSettings(),
    getUserProductSubscription(foundUser.id, "bisbi"),
  ]);

  const active = foundUser.role === "admin" || isActiveSubscription(sub);
  const tier = foundUser.role === "admin" ? "pro" : getSubscriptionTier(sub);
  const effectiveTier = active ? tier : "free";

  const wordsLimit = getBisbiFreeMonthlyWordLimit(settings);
  const isFree = effectiveTier === "free";
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
  });
}

// Called to read current usage without incrementing it.
export async function GET(request: NextRequest) {
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
  });
}
