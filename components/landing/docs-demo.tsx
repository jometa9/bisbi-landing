"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./docs-demo.css";

type Phase = "idle" | "recording" | "transcribing" | "typing" | "done";

const BARS = 14;
const CHUNK_SIZE = 4;
const CHUNK_INTERVAL = 240;

function detectMac(): boolean {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function phaseDuration(phase: Phase, wordCount: number): number {
  switch (phase) {
    case "idle":
      return 900;
    case "recording":
      return Math.max(2200, wordCount * 320 + 700);
    case "transcribing":
      return 1300;
    case "typing":
      return Math.max(700, Math.ceil(wordCount / CHUNK_SIZE) * CHUNK_INTERVAL + 200);
    case "done":
      return 2400;
  }
}

export function DocsDemo() {
  const { t } = useI18n();
  const demo = t.howItWorks.demo;

  const transcripts = useMemo(
    () => [demo.transcript, demo.transcriptLong].filter(Boolean) as string[],
    [demo.transcript, demo.transcriptLong]
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [committedText, setCommittedText] = useState("");
  const [spokenCount, setSpokenCount] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [isMac, setIsMac] = useState(true);
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const currentSentence = transcripts[sentenceIdx] ?? "";
  const words = useMemo(
    () => currentSentence.split(/\s+/).filter(Boolean),
    [currentSentence]
  );

  useEffect(() => {
    setIsMac(detectMac());
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setActive(e.isIntersecting);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      const isLast = sentenceIdx >= transcripts.length - 1;

      if (phase === "typing") {
        const justTyped = currentSentence;
        setCommittedText((prev) => (prev ? `${prev} ${justTyped}` : justTyped));
        if (isLast) {
          setPhase("done");
        } else {
          setSentenceIdx(sentenceIdx + 1);
          setPhase("idle");
        }
        return;
      }

      if (phase === "done") {
        setCommittedText("");
        setSentenceIdx(0);
        setPhase("idle");
        return;
      }

      if (phase === "idle") setPhase("recording");
      else if (phase === "recording") setPhase("transcribing");
      else if (phase === "transcribing") setPhase("typing");
    }, phaseDuration(phase, words.length));

    return () => window.clearTimeout(id);
  }, [phase, active, sentenceIdx, transcripts.length, currentSentence, words.length]);

  useEffect(() => {
    if (phase !== "recording") {
      setSpokenCount(0);
      return;
    }
    setSpokenCount(0);
    const total = phaseDuration("recording", words.length);
    const interval = Math.max(140, total / (words.length + 2));
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setSpokenCount(i);
      if (i >= words.length) window.clearInterval(id);
    }, interval);
    return () => window.clearInterval(id);
  }, [phase, words.length]);

  useEffect(() => {
    if (phase !== "typing") {
      setTypedCount(0);
      return;
    }
    setTypedCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i = Math.min(i + CHUNK_SIZE, words.length);
      setTypedCount(i);
      if (i >= words.length) window.clearInterval(id);
    }, CHUNK_INTERVAL);
    return () => window.clearInterval(id);
  }, [phase, words.length]);

  const spokenText = words.slice(0, spokenCount).join(" ");
  const partialTyped = words.slice(0, typedCount).join(" ");
  const isTyping = phase === "typing";

  const docText = isTyping
    ? committedText
      ? `${committedText} ${partialTyped}`
      : partialTyped
    : committedText;
  const showCursor = isTyping && typedCount < words.length;
  const showInitialCursor = !docText;

  const kbdPressed = phase === "recording";
  const pillVisible = phase === "recording" || phase === "transcribing";
  const captionsVisible = phase === "recording" && spokenText.length > 0;
  const keyGlyph = isMac ? "⌘" : "Alt";
  const pillState: "recording" | "transcribing" =
    phase === "transcribing" ? "transcribing" : "recording";

  return (
    <div
      ref={rootRef}
      className="docs-demo-frame"
      data-docs-demo-visible={active ? "true" : "false"}
    >
      <div className={`docs-demo docs-demo--${phase}`}>
        <DocsTitleBar title={demo.docsTitle} />
        <DocsToolbar title={demo.docsTitle} />
        <DocsRuler />
        <div className="docs-demo-canvas">
          <div className="docs-demo-page">
            <div className="docs-demo-page-meta">
              <span className="docs-demo-page-date">May 8, 2026</span>
              <span className="docs-demo-page-author">Jane Doe</span>
            </div>
            <h1 className="docs-demo-doc-heading">{demo.docsTitle}</h1>
            <div className="docs-demo-doc-body">
              {docText ? (
                <p className="docs-demo-doc-text">
                  <span className="docs-demo-doc-typed">{docText}</span>
                  {showCursor && (
                    <span className="docs-demo-cursor docs-demo-cursor--inline" />
                  )}
                </p>
              ) : (
                <p className="docs-demo-doc-text docs-demo-doc-text--empty">
                  {showInitialCursor && <span className="docs-demo-cursor" />}
                </p>
              )}
            </div>
          </div>

          <div
            className={`docs-demo-floating${kbdPressed ? " docs-demo-floating--pressed" : ""}`}
            aria-hidden="true"
          >
            <span className="docs-demo-floating-label">
              {kbdPressed ? demo.recordingLabel : demo.idleHint}
            </span>
            <div className="docs-demo-floating-keys">
              <kbd
                className={`docs-demo-kbd${kbdPressed ? " docs-demo-kbd--pressed" : ""}`}
              >
                {keyGlyph}
              </kbd>
            </div>
          </div>

          <div
            className={`docs-demo-bottom${pillVisible ? " docs-demo-bottom--visible" : ""}`}
            aria-hidden="true"
          >
            <div
              className={`docs-demo-captions${captionsVisible ? " docs-demo-captions--visible" : ""}`}
            >
              <span className="docs-demo-captions-text">
                {spokenText}
                <span className="docs-demo-captions-caret" />
              </span>
            </div>
            <DocsPill
              state={pillState}
              transcribingLabel={demo.transcribing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocsPill({
  state,
  transcribingLabel,
}: {
  state: "recording" | "transcribing";
  transcribingLabel: string;
}) {
  const [bars, setBars] = useState<number[]>(() => new Array(BARS).fill(0.2));
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setBars((prev) => {
        const next = prev.slice(1);
        const x = frame / 4;
        const v =
          state === "transcribing"
            ? 0.3 + 0.18 * Math.abs(Math.sin(x * 0.6 + 1.1))
            : 0.25 +
              0.55 *
                Math.abs(Math.sin(x * 0.9)) *
                (0.6 + 0.4 * Math.abs(Math.sin(x * 0.31)));
        next.push(v);
        return next;
      });
    }, 70);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "recording") return;
    setSeconds(0);
    const start = Date.now();
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [state]);

  const time = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className={`docs-demo-pill docs-demo-pill--${state}`}>
      <span className="docs-demo-pill-indicator" />
      <span className="docs-demo-pill-waveform">
        {bars.map((v, i) => (
          <span
            key={i}
            className="docs-demo-pill-bar"
            style={{ transform: `scaleY(${0.12 + Math.min(1, v) * 0.82})` }}
          />
        ))}
      </span>
      <span className="docs-demo-pill-label">
        {state === "transcribing" ? transcribingLabel : time}
      </span>
    </div>
  );
}

function DocsTitleBar({ title }: { title: string }) {
  return (
    <div className="docs-demo-titlebar" aria-hidden="true">
      <span className="docs-demo-traffic">
        <span className="docs-demo-traffic-dot docs-demo-traffic-dot--red" />
        <span className="docs-demo-traffic-dot docs-demo-traffic-dot--yellow" />
        <span className="docs-demo-traffic-dot docs-demo-traffic-dot--green" />
      </span>
      <span className="docs-demo-titlebar-title">{title} — Docs</span>
      <span />
    </div>
  );
}

function DocsToolbar({ title }: { title: string }) {
  return (
    <div className="docs-demo-topbar" aria-hidden="true">
      <div className="docs-demo-doc-icon">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            fill="#1a73e8"
          />
          <path d="M14 2v6h6" fill="#a3c5f7" />
          <rect x="7" y="12" width="10" height="1.4" fill="#fff" rx="0.5" />
          <rect x="7" y="15" width="10" height="1.4" fill="#fff" rx="0.5" />
          <rect x="7" y="18" width="6" height="1.4" fill="#fff" rx="0.5" />
        </svg>
      </div>
      <div className="docs-demo-titlecol">
        <div className="docs-demo-doctitle">
          <span>{title}</span>
          <span className="docs-demo-star">☆</span>
        </div>
        <div className="docs-demo-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Insert</span>
          <span>Format</span>
          <span>Tools</span>
          <span>Extensions</span>
          <span>Help</span>
        </div>
      </div>
      <div className="docs-demo-toolbar-actions">
        <button type="button" className="docs-demo-share" tabIndex={-1}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Share
        </button>
        <span className="docs-demo-avatar">J</span>
      </div>
    </div>
  );
}

function DocsRuler() {
  return (
    <div className="docs-demo-ruler" aria-hidden="true">
      <div className="docs-demo-ruler-bar">
        <button type="button" tabIndex={-1} className="docs-demo-ruler-btn" aria-label="Undo">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
          </svg>
        </button>
        <button type="button" tabIndex={-1} className="docs-demo-ruler-btn" aria-label="Redo">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
          </svg>
        </button>
        <span className="docs-demo-ruler-divider" />
        <span className="docs-demo-ruler-style">100%</span>
        <span className="docs-demo-ruler-divider" />
        <span className="docs-demo-ruler-style">Normal text</span>
        <span className="docs-demo-ruler-divider" />
        <span className="docs-demo-ruler-style docs-demo-ruler-style--font">Arial</span>
        <span className="docs-demo-ruler-divider" />
        <span className="docs-demo-ruler-num">11</span>
        <span className="docs-demo-ruler-divider" />
        <button type="button" tabIndex={-1} className="docs-demo-ruler-btn docs-demo-ruler-btn--bold">B</button>
        <button type="button" tabIndex={-1} className="docs-demo-ruler-btn docs-demo-ruler-btn--italic">I</button>
        <button type="button" tabIndex={-1} className="docs-demo-ruler-btn docs-demo-ruler-btn--underline">U</button>
        <span className="docs-demo-ruler-divider" />
        <span className="docs-demo-ruler-spacer" />
      </div>
    </div>
  );
}
