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
import { reconcileUserFromStripe } from "@/lib/subscriptions/on-demand-reconcile";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { releaseInfoFromSettings } from "@/lib/releases/github";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// OpenAI hard limit on /v1/audio/transcriptions is 25MB. We stay below that.
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;

type Quality = "fast" | "accurate";

// ---------------------------------------------------------------------------
// Cloud model selection is OWNED BY THE SERVER, never the client.
//
// The desktop app only sends the user-facing `quality` hint ("fast" |
// "accurate"). Which OpenAI model that resolves to — and whether we even
// honor the distinction — is decided here so we can change providers,
// upgrade snapshots, or A/B test without shipping a new desktop release.
//
// Current mapping (May 2026):
//   Both qualities → gpt-4o-mini-transcribe-2025-12-15
//
// Reasoning: OpenAI's December 2025 mini snapshot now beats the full
// gpt-4o-transcribe on FLEURS / Common Voice and ships 89% fewer
// hallucinations than whisper-1, while costing half as much
// ($0.003/min vs $0.006/min). Keeping accurate on the older full model
// would charge 2× without a quality win.
//
// To re-introduce a real fast/accurate split (e.g. if a future snapshot
// of the full model leapfrogs mini, or to enable diarization), bump only
// the value(s) below — no client change required.
// ---------------------------------------------------------------------------
const CLOUD_MODEL_FAST = "gpt-4o-mini-transcribe-2025-12-15";
const CLOUD_MODEL_ACCURATE = "gpt-4o-mini-transcribe-2025-12-15";

const MODEL_FOR_QUALITY: Record<Quality, string> = {
  fast: CLOUD_MODEL_FAST,
  accurate: CLOUD_MODEL_ACCURATE,
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  const { key } = getRateLimitKey(request);
  const rl = checkRateLimit(key, {
    scope: "transcribe:write",
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

  const settings = await getAppSettings();
  const openaiKey = settings.openaiApiKey;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "Cloud transcription is not configured on the server" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data body" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "Audio file too large", maxBytes: MAX_AUDIO_BYTES },
      { status: 413 }
    );
  }

  const rawQuality = (form.get("quality") ?? "fast").toString();
  const quality: Quality =
    rawQuality === "accurate" || rawQuality === "fast" ? rawQuality : "fast";
  const model = MODEL_FOR_QUALITY[quality];

  const prompt = ((form.get("prompt") ?? "") as string).trim();
  const audioSecondsRaw = Number(form.get("audioSeconds"));
  const audioSeconds =
    Number.isFinite(audioSecondsRaw) && audioSecondsRaw > 0
      ? Math.min(86_400, Math.floor(audioSecondsRaw))
      : 0;

  await reconcileUserFromStripe(foundUser.id, foundUser.stripeCustomerId);

  const monthKey = currentMonthKey();
  const [existing, sub] = await Promise.all([
    getUserMonthlyUsage(foundUser.id, "bisbi", monthKey),
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

  const upstreamForm = new FormData();
  upstreamForm.append("file", file, file.name || "audio.wav");
  upstreamForm.append("model", model);
  upstreamForm.append("temperature", "0");
  upstreamForm.append("response_format", "json");
  if (prompt) {
    upstreamForm.append("prompt", prompt.slice(0, 1024));
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: upstreamForm,
    });
  } catch (err) {
    console.error("[transcribe] upstream network error", err);
    return NextResponse.json(
      { error: "Cloud transcription service unavailable" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error(
      "[transcribe] upstream non-2xx",
      upstream.status,
      detail.slice(0, 500)
    );
    return NextResponse.json(
      { error: "Cloud transcription failed" },
      { status: 502 }
    );
  }

  let payload: { text?: string; language?: string } = {};
  try {
    payload = (await upstream.json()) as { text?: string; language?: string };
  } catch {
    return NextResponse.json(
      { error: "Cloud transcription returned malformed response" },
      { status: 502 }
    );
  }

  const text = (payload.text ?? "").trim();
  const detectedLanguage = payload.language ?? null;
  const wordCount = countWords(text);

  if (wordCount > 0) {
    try {
      await addUserMonthlyUsage(foundUser.id, "bisbi", {
        words: wordCount,
        audioSeconds,
        transcriptionsCount: 1,
      });
    } catch (err) {
      console.error("[transcribe] usage write failed", err);
    }
  }

  const durationMs = Date.now() - startedAt;
  return NextResponse.json({
    ok: true,
    text,
    language: detectedLanguage,
    durationMs,
    audioDurationMs: audioSeconds * 1000,
    model,
    tier: effectiveTier,
    monthKey,
    wordsUsed: (existing?.wordsUsed ?? 0) + wordCount,
    wordsLimit: isFree ? wordsLimit : null,
    release: releaseInfoFromSettings(settings),
  });
}
