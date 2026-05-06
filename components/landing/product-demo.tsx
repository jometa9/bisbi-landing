"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Platform = "mac" | "win";

const HOTKEY_PARTS = ["CommandOrControl", "Shift", "Space"] as const;

const MAC_GLYPHS: Record<string, string> = {
  CommandOrControl: "⌘",
  Shift: "⇧",
  Space: "Space",
};

const WIN_GLYPHS: Record<string, string> = {
  CommandOrControl: "Ctrl",
  Shift: "Shift",
  Space: "Space",
};

const BARS = 14;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "mac";
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? "mac" : "win";
}

export function ProductDemo() {
  const { t } = useI18n();
  const steps = t.howItWorks.steps;
  const demo = t.howItWorks.demo;

  const [platform, setPlatform] = useState<Platform>("mac");
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const glyphs = platform === "mac" ? MAC_GLYPHS : WIN_GLYPHS;

  return (
    <div className="demo-stack">
      <DemoCard index={1} title={steps[0].title} description={steps[0].description}>
        <HotkeyCard
          state="idle"
          platform={platform}
          glyphs={glyphs}
          label={demo.hotkeyLabel}
          hint={demo.idleHint}
        />
      </DemoCard>

      <DemoCard index={2} title={steps[1].title} description={steps[1].description}>
        <HotkeyCard
          state="recording"
          platform={platform}
          glyphs={glyphs}
          label={demo.hotkeyLabel}
          hint={demo.recordingHint}
          watermark={demo.transcript}
          recordingLabel={demo.recordingLabel}
        />
        <RecordingPill />
      </DemoCard>

      <DemoCard index={3} title={steps[2].title} description={steps[2].description}>
        <EditorMock
          title={demo.editorTitle}
          placeholder={demo.editorPlaceholder}
          transcript={demo.transcript}
          hint={demo.pasteHint}
        />
      </DemoCard>
    </div>
  );
}

function DemoCard({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="demo-card">
      <div className="demo-card-header">
        <span className="demo-step-num">
          {String(index).padStart(2, "0")}
        </span>
        <div className="demo-step-text">
          <h3 className="demo-step-title">{title}</h3>
          <p className="demo-step-desc">{description}</p>
        </div>
      </div>
      <div className="demo-card-body">{children}</div>
    </div>
  );
}

function HotkeyCard({
  state,
  platform,
  glyphs,
  label,
  hint,
  watermark,
  recordingLabel,
}: {
  state: "idle" | "recording";
  platform: Platform;
  glyphs: Record<string, string>;
  label: string;
  hint: string;
  watermark?: string;
  recordingLabel?: string;
}) {
  const isRecording = state === "recording";
  return (
    <div
      className={`demo-hotkey${isRecording ? " demo-hotkey--recording" : ""}`}
    >
      {watermark && (
        <div className="demo-hotkey-watermark" aria-hidden="true">
          {watermark}
        </div>
      )}
      <div className="demo-hotkey-content">
        <span className="demo-hotkey-label">
          {isRecording && recordingLabel ? (
            <span className="demo-hotkey-status">
              <span className="demo-hotkey-dot" />
              {recordingLabel}
            </span>
          ) : (
            label
          )}
        </span>
        <div className="demo-hotkey-keys">
          {HOTKEY_PARTS.map((part, i) => (
            <span key={part} className="demo-kbd-row">
              <kbd
                className={`demo-kbd demo-kbd-${platform}${
                  isRecording ? " demo-kbd-pressed" : ""
                }`}
              >
                {glyphs[part]}
              </kbd>
              {i < HOTKEY_PARTS.length - 1 && (
                <span className="demo-kbd-plus">+</span>
              )}
            </span>
          ))}
        </div>
        <span className="demo-hotkey-hint">{hint}</span>
      </div>
    </div>
  );
}

function RecordingPill() {
  const [bars, setBars] = useState<number[]>(() => new Array(BARS).fill(0.15));
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setBars((prev) => {
        const next = prev.slice(1);
        const t = frame / 4;
        const v =
          0.25 +
          0.55 * Math.abs(Math.sin(t * 0.9)) *
            (0.6 + 0.4 * Math.abs(Math.sin(t * 0.31)));
        next.push(v);
        return next;
      });
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className="demo-pill" role="img" aria-label="Recording">
      <span className="demo-pill-indicator" />
      <span className="demo-pill-waveform">
        {bars.map((v, i) => (
          <span
            key={i}
            className="demo-pill-bar"
            style={{ transform: `scaleY(${0.12 + Math.min(1, v) * 0.78})` }}
          />
        ))}
      </span>
      <span className="demo-pill-time">{time}</span>
    </div>
  );
}

function EditorMock({
  title,
  placeholder,
  transcript,
  hint,
}: {
  title: string;
  placeholder: string;
  transcript: string;
  hint: string;
}) {
  const [typed, setTyped] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !inViewRef.current) {
            inViewRef.current = true;
            startTyping();
          }
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);

    let timeout: number | undefined;
    let interval: number | undefined;

    function startTyping() {
      let i = 0;
      setTyped("");
      timeout = window.setTimeout(() => {
        interval = window.setInterval(() => {
          i += 1;
          setTyped(transcript.slice(0, i));
          if (i >= transcript.length) {
            window.clearInterval(interval);
            timeout = window.setTimeout(() => {
              setTyped("");
              inViewRef.current = false;
              if (wrapperRef.current) startTyping();
            }, 2800);
          }
        }, 28);
      }, 600);
    }

    return () => {
      obs.disconnect();
      if (timeout) window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [transcript]);

  const showPlaceholder = typed.length === 0;

  return (
    <div ref={wrapperRef} className="demo-editor">
      <div className="demo-editor-bar">
        <span className="demo-editor-dot demo-editor-dot--red" />
        <span className="demo-editor-dot demo-editor-dot--yellow" />
        <span className="demo-editor-dot demo-editor-dot--green" />
        <span className="demo-editor-title">{title}</span>
      </div>
      <div className="demo-editor-body">
        <div className="demo-editor-text">
          {showPlaceholder ? (
            <span className="demo-editor-placeholder">{placeholder}</span>
          ) : (
            <span>{typed}</span>
          )}
          <span className="demo-editor-caret" aria-hidden="true" />
        </div>
        <p className="demo-editor-hint">{hint}</p>
      </div>
    </div>
  );
}
