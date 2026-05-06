"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import "./windows-demo.css";

// Static, frozen-in-time replica of the Bisbi Electron app, used to show
// visitors what the product looks like once installed. The whole tree is
// inert (pointer-events: none) — no real handlers, no IPC, no data fetching.
// User shows up logged-in on the Pro plan with mocked stats and history.

type Platform = "mac" | "win";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "win";
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "mac" : "win";
}

const MOCK_STATS = {
  totalTranscriptions: 1284,
  totalAudioMs: 5_412_000,
  totalWords: 18_932,
};

const MOCK_RECENT_META = [
  { id: "1", timeLabel: "9:42 AM", groupKey: "today" as const },
  { id: "2", timeLabel: "9:14 AM", groupKey: "today" as const },
  { id: "3", timeLabel: "5:48 PM", groupKey: "yesterday" as const },
];

const LOCALE_FOR_LANG: Record<Lang, string> = {
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
  hi: "hi-IN",
  ar: "ar",
};

function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE_FOR_LANG[lang]).format(n);
}

function formatDuration(s: number): string {
  if (s <= 0) return "0s";
  if (s < 60) return `${s}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

type GreetingKey = "lateNight" | "morning" | "afternoon" | "evening";

function timeGreetingKey(): GreetingKey {
  if (typeof Date === "undefined") return "afternoon";
  const h = new Date().getHours();
  if (h < 6) return "lateNight";
  if (h < 13) return "morning";
  if (h < 20) return "afternoon";
  return "evening";
}

export function WindowsDemo() {
  const { t, lang } = useI18n();
  const demo = t.demoApp;
  const [platform, setPlatform] = useState<Platform>("win");
  const [greetingKey, setGreetingKey] = useState<GreetingKey>("afternoon");

  useEffect(() => {
    setPlatform(detectPlatform());
    setGreetingKey(timeGreetingKey());
  }, []);

  const greeting = demo.greetings[greetingKey];
  const wpm = Math.round(MOCK_STATS.totalWords / (MOCK_STATS.totalAudioMs / 60000));
  const recentRows = MOCK_RECENT_META.map((row, i) => ({
    ...row,
    text: demo.recent[i] ?? "",
  }));
  const lastTranscription = recentRows[0]?.text ?? "";

  const owlVars = {
    "--owl-idle": "url(/owl_head.svg)",
    "--owl-rec": "url(/owl_head_rec.svg)",
  } as CSSProperties;

  return (
    <div className="bisbi-demo-frame">
    <div className="bisbi-demo" role="img" aria-label="Bisbi product demo">
      <TitleBar />
      <div className="app" style={owlVars}>
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-brand">Bisbi</div>
          </div>
          <nav className="sidebar-nav" aria-hidden="true">
            <button type="button" className="active" tabIndex={-1}>
              <HomeIcon />
              {demo.nav.home}
            </button>
            <button type="button" tabIndex={-1}>
              <HistoryIcon />
              {demo.nav.history}
            </button>
            <button type="button" tabIndex={-1}>
              <SettingsIcon />
              {demo.nav.settings}
            </button>
          </nav>
          <div className="sidebar-bottom">
            <button type="button" className="sidebar-account" tabIndex={-1}>
              <span className="sidebar-account-avatar" aria-hidden="true">
                {demo.user.initial}
              </span>
              <span className="sidebar-account-text">
                <span className="sidebar-account-name">{demo.user.name}</span>
                <span className="sidebar-account-plan plan-pro">{demo.plan.pro}</span>
              </span>
            </button>
            <div className="sidebar-status-row">
              <span className="badge badge-idle">{demo.badgeIdle}</span>
              <span className="sidebar-version">v1.0.0</span>
            </div>
          </div>
        </aside>

        <main className="content">
          <div className="content-inner">
            <div className="home">
              <div className="home-hero">
                <span className="home-greeting">{greeting}</span>
                <h1 className="home-title">
                  {demo.statusTitle}.
                  <br />
                  <em>{demo.titleHint}</em>
                </h1>
              </div>

              <div className="home-hotkey">
                <div className="home-hotkey-watermark" aria-hidden="true">
                  {lastTranscription}
                </div>
                <div className="home-hotkey-content">
                  <span className="home-hotkey-label">{demo.hotkeyLabel}</span>
                  <div className="home-hotkey-keys">
                    {platform === "mac" ? (
                      <kbd className="kbd kbd-mac">⌘</kbd>
                    ) : (
                      <kbd className="kbd kbd-win">Alt</kbd>
                    )}
                  </div>
                  <span className="home-hotkey-hint">{demo.hotkeyHint}</span>
                </div>
              </div>

              <section className="home-section">
                <h2 className="home-section-title">{demo.activitySection}</h2>
                <div className="home-stats">
                  <Stat
                    value={formatNumber(MOCK_STATS.totalTranscriptions, lang)}
                    label={demo.statTranscriptions}
                  />
                  <Stat
                    value={formatDuration(Math.round(MOCK_STATS.totalAudioMs / 1000))}
                    label={demo.statDictated}
                  />
                  <Stat
                    value={formatNumber(MOCK_STATS.totalWords, lang)}
                    label={demo.statWords}
                  />
                  <Stat value={formatNumber(wpm, lang)} label={demo.statWpm} />
                </div>
              </section>

              <section className="home-section">
                <h2 className="home-section-title">{demo.recentSection}</h2>
                <div className="tx-list">
                  <RecentGroup
                    label={demo.dateGroups.today}
                    rows={recentRows.filter((r) => r.groupKey === "today")}
                  />
                  <RecentGroup
                    label={demo.dateGroups.yesterday}
                    rows={recentRows.filter((r) => r.groupKey === "yesterday")}
                  />
                </div>
                <button type="button" className="home-see-more" tabIndex={-1}>
                  {demo.seeMore}
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="home-stat">
      <span className="home-stat-value">{value}</span>
      <span className="home-stat-label">{label}</span>
    </div>
  );
}

function RecentGroup({
  label,
  rows,
}: {
  label: string;
  rows: { id: string; timeLabel: string; text: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="tx-group">
      <h3 className="tx-group-title">{label}</h3>
      <ul className="tx-items">
        {rows.map((row) => (
          <li key={row.id} className="tx-item">
            <span className="tx-time">{row.timeLabel}</span>
            <div className="tx-body">
              <p className="tx-text">{formatTranscript(row.text)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TRANSCRIPT_TOKEN_RE =
  /\[[^\]\n]+\]|\([^)\n]+\)|\b[\p{Lu}\p{N}][\p{Lu}\p{N}'’\-]{2,}\b/gu;

function formatTranscript(text: string): React.ReactNode {
  if (!text) return text;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(TRANSCRIPT_TOKEN_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    const token = match[0];
    const first = token[0];
    if (first === "[" || first === "(") {
      nodes.push(
        <em key={key++} className="tx-annotation">
          {token}
        </em>
      );
    } else {
      nodes.push(
        <strong key={key++} className="tx-emphasis">
          {token}
        </strong>
      );
    }
    lastIndex = start + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}

function TitleBar() {
  return (
    <div className="bisbi-demo-titlebar" aria-hidden="true">
      <div className="bisbi-demo-titlebar-left">
        <span>Bisbi</span>
      </div>
      <div className="bisbi-demo-titlebar-controls">
        <span className="bisbi-demo-titlebar-btn">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="0" y1="5" x2="10" y2="5" />
          </svg>
        </span>
        <span className="bisbi-demo-titlebar-btn">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </span>
        <span className="bisbi-demo-titlebar-btn bisbi-demo-titlebar-btn--close">
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg
      className="nav-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      className="nav-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="nav-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
