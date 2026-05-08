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
      return Math.max(1600, wordCount * 180 + 500);
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
    () =>
      [demo.transcript, demo.transcriptLong, demo.transcriptOwl].filter(
        Boolean
      ) as string[],
    [demo.transcript, demo.transcriptLong, demo.transcriptOwl]
  );
  const owlSentence = demo.transcriptOwl ?? "";

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
    const interval = Math.max(85, total / (words.length + 2));
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

  const spokenWords = words.slice(0, spokenCount);
  const partialTyped = words.slice(0, typedCount).join(" ");
  const isTyping = phase === "typing";

  const docText = isTyping
    ? committedText
      ? `${committedText} ${partialTyped}`
      : partialTyped
    : committedText;
  const showCursor = isTyping && typedCount < words.length;
  const showInitialCursor = !docText;
  const showOwlGif = !!owlSentence && committedText.includes(owlSentence);

  const kbdPressed = phase === "recording";
  const pillVisible = phase === "recording" || phase === "transcribing";
  const captionsVisible = phase === "recording" && spokenWords.length > 0;
  const keyGlyph = isMac ? "⌘" : "Alt";
  const pillState: "recording" | "transcribing" =
    phase === "transcribing" ? "transcribing" : "recording";

  return (
    <div className="docs-demo-shell">
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
              <span className="docs-demo-page-author">Joaquin</span>
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
              {showOwlGif && (
                <figure className="docs-demo-doc-gif">
                  <img src="/assets/giphy.gif" alt="" />
                </figure>
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
                {spokenWords.map((w, i) => (
                  <span
                    key={`${sentenceIdx}-${i}`}
                    className="docs-demo-captions-word"
                  >
                    {i > 0 ? " " : ""}
                    {w}
                  </span>
                ))}
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
    </div>
  );
}

function DocsPill({
  state,
}: {
  state: "recording" | "transcribing";
  transcribingLabel: string;
}) {
  const [bars, setBars] = useState<number[]>(() => new Array(BARS).fill(0.2));
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (state === "recording") {
      const id = window.setInterval(() => {
        setBars((prev) => {
          const next = prev.slice(1);
          const burst = Math.random() < 0.18 ? 0.1 : 0.25 + Math.random() * 0.7;
          next.push(burst);
          return next;
        });
      }, 70);
      return () => window.clearInterval(id);
    }
    if (state === "transcribing") {
      let frame = 0;
      const id = window.setInterval(() => {
        frame += 1;
        setBars((prev) => {
          const next = prev.slice(1);
          const x = frame / 4;
          const v =
            0.25 +
            0.55 *
              Math.abs(Math.sin(x * 0.9)) *
              (0.6 + 0.4 * Math.abs(Math.sin(x * 0.31)));
          next.push(v);
          return next;
        });
      }, 70);
      return () => window.clearInterval(id);
    }
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
      <span className="docs-demo-pill-label">{time}</span>
    </div>
  );
}

function DocsTitleBar({ title }: { title: string }) {
  return (
    <div className="docs-demo-titlebar" aria-hidden="true">
      <div className="docs-demo-titlebar-left">
        <span>{title} — Docs</span>
      </div>
      <div className="docs-demo-titlebar-controls">
        <span className="docs-demo-titlebar-btn">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="0" y1="5" x2="10" y2="5" />
          </svg>
        </span>
        <span className="docs-demo-titlebar-btn">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </span>
        <span className="docs-demo-titlebar-btn docs-demo-titlebar-btn--close">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function DocsToolbar({ title }: { title: string }) {
  return (
    <div className="docs-demo-topbar" aria-hidden="true">
      <div className="docs-demo-doc-icon">
        <svg viewBox="0 0 47 65" width="28" height="38" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M29.375 0H4.4063C1.9824 0 0 1.9824 0 4.4063V60.5938C0 63.0176 1.9824 65 4.4063 65H42.5938C45.0176 65 47 63.0176 47 60.5938V17.625L36.7188 10.2812L29.375 0Z"
            fill="#4285F4"
          />
          <path
            d="M12.4688 47.4688H34.5313V44.5313H12.4688V47.4688ZM12.4688 53.3438H29.375V50.4063H12.4688V53.3438ZM12.4688 35.7188H34.5313V32.7813H12.4688V35.7188ZM12.4688 41.5938H34.5313V38.6563H12.4688V41.5938ZM12.4688 26.9063V29.8438H34.5313V26.9063H12.4688Z"
            fill="#F1F1F1"
          />
          <path
            d="M30.8438 16.1563L47 32.3125V17.625L30.8438 16.1563Z"
            fill="#1A65C1"
          />
          <path
            d="M29.375 0V13.2188C29.375 15.6512 31.3488 17.625 33.7813 17.625H47L29.375 0Z"
            fill="#A1C2FA"
          />
        </svg>
      </div>
      <div className="docs-demo-titlecol">
        <div className="docs-demo-doctitle">
          <span>{title}</span>
          <span className="docs-demo-titleicon material-symbols-outlined" aria-hidden="true">star</span>
          <span className="docs-demo-titleicon material-symbols-outlined" aria-hidden="true">drive_file_move</span>
          <span className="docs-demo-titleicon material-symbols-outlined" aria-hidden="true">cloud_done</span>
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
        <button type="button" className="docs-demo-iconbtn" tabIndex={-1} aria-label="Version history">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button type="button" className="docs-demo-iconbtn" tabIndex={-1} aria-label="Comments">
          <span className="material-symbols-outlined">chat</span>
        </button>
        <button type="button" className="docs-demo-iconbtn docs-demo-iconbtn--combo" tabIndex={-1} aria-label="Video call">
          <span className="material-symbols-outlined">videocam</span>
          <span className="material-symbols-outlined docs-demo-iconbtn-chev">arrow_drop_down</span>
        </button>
        <span className="docs-demo-share-group">
          <button type="button" className="docs-demo-share" tabIndex={-1}>
            <span className="material-symbols-outlined">lock</span>
            Share
          </button>
          <span className="docs-demo-share-sep" />
          <button type="button" className="docs-demo-share-chev" tabIndex={-1} aria-label="Share options">
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
        </span>
        <button type="button" className="docs-demo-iconbtn" tabIndex={-1} aria-label="Gemini">
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
        <span className="docs-demo-avatar">
          <img src="/assets/founder4.png" alt="" />
        </span>
      </div>
    </div>
  );
}

function DocsRuler() {
  const chev = (
    <span className="material-symbols-outlined docs-demo-ruler-chev">arrow_drop_down</span>
  );
  const RB = ({ icon, label, combo }: { icon: string; label: string; combo?: boolean }) => (
    <button
      type="button"
      tabIndex={-1}
      className={`docs-demo-ruler-btn${combo ? " docs-demo-ruler-btn--combo" : ""}`}
      aria-label={label}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {combo ? chev : null}
    </button>
  );
  return (
    <div className="docs-demo-ruler" aria-hidden="true">
      <div className="docs-demo-ruler-bar">
        <RB icon="search" label="Search" />
        <RB icon="undo" label="Undo" />
        <RB icon="redo" label="Redo" />
        <RB icon="print" label="Print" />
        <RB icon="spellcheck" label="Spellcheck" />
        <RB icon="format_paint" label="Paint format" />
        <span className="docs-demo-ruler-divider" />
        <button type="button" tabIndex={-1} className="docs-demo-ruler-style">100% {chev}</button>
        <span className="docs-demo-ruler-divider" />
        <button type="button" tabIndex={-1} className="docs-demo-ruler-style">Normal text {chev}</button>
        <span className="docs-demo-ruler-divider" />
        <button type="button" tabIndex={-1} className="docs-demo-ruler-style docs-demo-ruler-style--font">Arial {chev}</button>
        <span className="docs-demo-ruler-divider" />
        <RB icon="remove" label="Decrease font size" />
        <span className="docs-demo-ruler-numbox">11</span>
        <RB icon="add" label="Increase font size" />
        <span className="docs-demo-ruler-divider" />
        <RB icon="format_bold" label="Bold" />
        <RB icon="format_italic" label="Italic" />
        <RB icon="format_underlined" label="Underline" />
        <RB icon="format_color_text" label="Text color" />
        <RB icon="border_color" label="Highlight" />
        <span className="docs-demo-ruler-divider" />
        <RB icon="add_link" label="Insert link" />
        <RB icon="add_comment" label="Add comment" />
        <RB icon="add_photo_alternate" label="Insert image" />
        <span className="docs-demo-ruler-divider" />
        <RB icon="format_align_left" label="Align" combo />
        <RB icon="format_line_spacing" label="Line spacing" combo />
        <RB icon="checklist" label="Checklist" combo />
        <RB icon="format_list_bulleted" label="Bulleted list" combo />
        <RB icon="format_list_numbered" label="Numbered list" combo />
        <RB icon="format_indent_decrease" label="Decrease indent" />
        <RB icon="format_indent_increase" label="Increase indent" />
        <RB icon="format_clear" label="Clear formatting" />
        <span className="docs-demo-ruler-divider" />
        <button type="button" tabIndex={-1} className="docs-demo-ruler-style docs-demo-ruler-style--lang">Es {chev}</button>
        <span className="docs-demo-ruler-spacer" />
        <RB icon="edit" label="Editing mode" combo />
        <RB icon="keyboard_arrow_up" label="Hide toolbar" />
      </div>
    </div>
  );
}
