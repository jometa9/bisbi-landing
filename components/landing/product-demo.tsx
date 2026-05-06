"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Platform = "mac" | "win";

const BARS = 12;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "mac";
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "mac" : "win";
}

function hotkeyForPlatform(p: Platform): string {
  return p === "mac" ? "⌘" : "Alt";
}

export function ProductDemo() {
  const { t } = useI18n();
  const steps = t.howItWorks.steps;
  const demo = t.howItWorks.demo;

  const [platform, setPlatform] = useState<Platform>("mac");
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const keyGlyph = hotkeyForPlatform(platform);

  return (
    <div className="demo-stack">
      <DemoCard index={1} title={steps[0].title} description={steps[0].description}>
        <HomeMock
          mode="press-cycle"
          platform={platform}
          keyGlyph={keyGlyph}
          hotkeyLabel={demo.hotkeyLabel}
          pasteHint={demo.pasteHint}
          watermark={demo.previousTranscript}
        />
      </DemoCard>

      <DemoCard index={2} title={steps[1].title} description={steps[1].description}>
        <HomeMock
          mode="recording"
          platform={platform}
          keyGlyph={keyGlyph}
          hotkeyLabel={demo.hotkeyLabel}
          pasteHint={demo.pasteHint}
          watermark={demo.transcript}
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
    <div className="demo-step">
      <div className="demo-step-header">
        <span className="demo-step-num">
          {String(index).padStart(2, "0")}
        </span>
        <div className="demo-step-text">
          <h3 className="demo-step-title">{title}</h3>
          <p className="demo-step-desc">{description}</p>
        </div>
      </div>
      <div className="demo-step-body">{children}</div>
    </div>
  );
}

function HomeMock({
  mode,
  platform,
  keyGlyph,
  hotkeyLabel,
  pasteHint,
  watermark,
}: {
  mode: "press-cycle" | "recording";
  platform: Platform;
  keyGlyph: string;
  hotkeyLabel: string;
  pasteHint: string;
  watermark?: string;
}) {
  const isRecording = mode === "recording";

  // Step 1: cycle the kbd between idle and pressed state.
  const [cyclePressed, setCyclePressed] = useState(false);
  useEffect(() => {
    if (mode !== "press-cycle") return;
    let pressed = false;
    setCyclePressed(false);
    const tick = () => {
      pressed = !pressed;
      setCyclePressed(pressed);
    };
    const idleHold = 1400;
    const pressedHold = 900;
    let timeout = window.setTimeout(function loop() {
      tick();
      timeout = window.setTimeout(loop, pressed ? pressedHold : idleHold);
    }, idleHold);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  const kbdPressed = isRecording || cyclePressed;

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
        <span className="demo-hotkey-label">{hotkeyLabel}</span>
        <div className="demo-hotkey-keys">
          <kbd
            className={`demo-kbd demo-kbd-${platform}${
              kbdPressed ? " demo-kbd-pressed" : ""
            }`}
          >
            {keyGlyph}
          </kbd>
        </div>
        <span className="demo-hotkey-hint">{pasteHint}</span>
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
          0.55 *
            Math.abs(Math.sin(t * 0.9)) *
            (0.6 + 0.4 * Math.abs(Math.sin(t * 0.31)));
        next.push(v);
        return next;
      });
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      if (elapsed >= 30) {
        start = Date.now();
        setSeconds(0);
      } else {
        setSeconds(elapsed);
      }
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

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let timeout: number | undefined;
    let interval: number | undefined;
    let started = false;
    let cancelled = false;

    function clearTimers() {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
      if (interval) {
        window.clearInterval(interval);
        interval = undefined;
      }
    }

    function startTyping() {
      if (cancelled) return;
      clearTimers();
      let i = 0;
      setTyped("");
      timeout = window.setTimeout(() => {
        interval = window.setInterval(() => {
          i += 1;
          setTyped(transcript.slice(0, i));
          if (i >= transcript.length) {
            if (interval) {
              window.clearInterval(interval);
              interval = undefined;
            }
            timeout = window.setTimeout(() => {
              startTyping();
            }, 3200);
          }
        }, 70);
      }, 600);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            startTyping();
          }
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);

    return () => {
      cancelled = true;
      obs.disconnect();
      clearTimers();
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
