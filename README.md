<p align="center">
  <img src="public/owl_head.svg" alt="Bisbi" width="96" height="96" />
</p>

<h1 align="center">Bisbi — Landing</h1>

<p align="center">
  <em>Press. Speak. Paste.</em><br>
  Voice dictation that types where your cursor is — in any app, in any language.
</p>

<p align="center">
  <a href="https://github.com/jometa9/Bisbi"><strong>App & source code →</strong></a>
</p>

---

## What is Bisbi

Bisbi is a free, open source voice dictation app for **Mac** and **Windows**.

1. **Press your shortcut** — the hotkey you choose.
2. **Speak naturally** — any language, any accent, any speed.
3. **Text appears** — exactly where your cursor is, in any app.

No accounts. No subscriptions. No usage limits. Audio stays private (zero retention).

> The desktop app lives in a separate repo: **<https://github.com/jometa9/Bisbi>** — that's where you'll find releases, the source, and how to contribute.

This repository is **only the marketing landing** (`bisbi.io`).

## Features

- Works in any app — Slack, Gmail, Notion, Word, terminal, browser, anywhere your cursor is.
- One shortcut to dictate — no window to open, no app to switch.
- 99 languages, recognized automatically.
- Mac and Windows.
- 100% free and open source.

## This repo

Static Next.js landing page. One route (`/`). No backend, no database, no auth, no API.

### Stack

- [Next.js 15](https://nextjs.org/) (App Router) — server-rendered, fully static output
- React 19
- Tailwind CSS v4
- 5 locales (en, es, zh, hi, ar) via a tiny client-side i18n provider in [lib/i18n](lib/i18n)

### Run locally

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # production build
npm start        # serve the production build
```

### Project layout

```
app/
  (dashboard)/page.tsx     home page (only route)
  layout.tsx               root layout
  sitemap.ts, robots.ts    SEO
components/
  landing/                 hero, pricing, demos, download buttons, header
  layout/footer.tsx
  icons/                   Mac / Windows / GitHub icons
  language-switcher.tsx
lib/
  downloads.ts             editable download URLs (per OS) + OS detection
  i18n/                    locale dictionaries
  app-url.ts               base URL helper
public/                    static assets (logo, gifs, images)
```

### Updating download links

Download URLs and the source repo link are configured in a single place: [lib/downloads.ts](lib/downloads.ts).

```ts
export const DOWNLOADS: Record<DownloadOS, string> = {
  mac: "https://github.com/jometa9/Bisbi/releases/latest/download/Bisbi.dmg",
  windows: "https://github.com/jometa9/Bisbi/releases/latest/download/Bisbi-Setup.exe",
};

export const SOURCE_REPO_URL = "https://github.com/jometa9/Bisbi";
```

Edit those values when you publish a new release. The landing detects the visitor's OS and shows the matching download button first.

## License

Landing source is open. The Bisbi app itself is open source at <https://github.com/jometa9/Bisbi>.

---

<p align="center">
  Made by <a href="https://api2labs.com">API2LABS</a>
</p>
