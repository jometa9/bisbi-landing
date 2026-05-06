"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { ProductDemo } from "@/components/landing/product-demo";
import { Footer } from "@/components/layout/footer";
import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { signIn } from "next-auth/react";
import Image from "next/image";

const LANG_CODES = ["EN", "ES", "PT", "FR", "IT", "DE", "ZH", "HI", "AR"] as const;

const COMPATIBLE_APPS = [
  // Communication
  { slug: "slack", name: "Slack" },
  { slug: "discord", name: "Discord" },
  { slug: "microsoftteams", name: "Teams" },
  { slug: "zoom", name: "Zoom" },
  { slug: "skype", name: "Skype" },
  { slug: "telegram", name: "Telegram" },
  { slug: "whatsapp", name: "WhatsApp" },
  { slug: "messenger", name: "Messenger" },
  { slug: "signal", name: "Signal" },
  { slug: "mattermost", name: "Mattermost" },
  { slug: "webex", name: "Webex" },
  { slug: "googlemeet", name: "Google Meet" },
  // Email
  { slug: "gmail", name: "Gmail" },
  { slug: "microsoftoutlook", name: "Outlook" },
  { slug: "protonmail", name: "Proton Mail" },
  // Docs / Notes
  { slug: "notion", name: "Notion" },
  { slug: "googledocs", name: "Google Docs" },
  { slug: "microsoftword", name: "Word" },
  { slug: "microsoft", name: "Microsoft" },
  { slug: "obsidian", name: "Obsidian" },
  { slug: "evernote", name: "Evernote" },
  { slug: "microsoftonenote", name: "OneNote" },
  { slug: "confluence", name: "Confluence" },
  { slug: "coda", name: "Coda" },
  // Project Mgmt
  { slug: "asana", name: "Asana" },
  { slug: "trello", name: "Trello" },
  { slug: "jira", name: "Jira" },
  { slug: "linear", name: "Linear" },
  { slug: "clickup", name: "ClickUp" },
  { slug: "basecamp", name: "Basecamp" },
  { slug: "airtable", name: "Airtable" },
  { slug: "todoist", name: "Todoist" },
  // Design
  { slug: "figma", name: "Figma" },
  { slug: "miro", name: "Miro" },
  { slug: "sketch", name: "Sketch" },
  { slug: "adobe", name: "Adobe" },
  { slug: "adobephotoshop", name: "Photoshop" },
  { slug: "adobeillustrator", name: "Illustrator" },
  { slug: "canva", name: "Canva" },
  { slug: "framer", name: "Framer" },
  // Dev / IDEs
  { slug: "visualstudiocode", name: "VS Code" },
  { slug: "cursor", name: "Cursor" },
  { slug: "github", name: "GitHub" },
  { slug: "gitlab", name: "GitLab" },
  { slug: "bitbucket", name: "Bitbucket" },
  { slug: "jetbrains", name: "JetBrains" },
  { slug: "intellijidea", name: "IntelliJ IDEA" },
  { slug: "pycharm", name: "PyCharm" },
  { slug: "sublimetext", name: "Sublime Text" },
  { slug: "vim", name: "Vim" },
  { slug: "replit", name: "Replit" },
  // Languages / Frameworks
  { slug: "javascript", name: "JavaScript" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "python", name: "Python" },
  { slug: "react", name: "React" },
  { slug: "vuedotjs", name: "Vue" },
  { slug: "angular", name: "Angular" },
  { slug: "nodedotjs", name: "Node.js" },
  { slug: "nextdotjs", name: "Next.js" },
  { slug: "svelte", name: "Svelte" },
  { slug: "tailwindcss", name: "Tailwind CSS" },
  { slug: "html5", name: "HTML5" },
  { slug: "rust", name: "Rust" },
  { slug: "go", name: "Go" },
  { slug: "prisma", name: "Prisma" },
  // Cloud / Infra
  { slug: "amazonwebservices", name: "AWS" },
  { slug: "googlecloud", name: "Google Cloud" },
  { slug: "microsoftazure", name: "Azure" },
  { slug: "vercel", name: "Vercel" },
  { slug: "netlify", name: "Netlify" },
  { slug: "cloudflare", name: "Cloudflare" },
  { slug: "docker", name: "Docker" },
  { slug: "kubernetes", name: "Kubernetes" },
  { slug: "linux", name: "Linux" },
  { slug: "ubuntu", name: "Ubuntu" },
  // Databases
  { slug: "postgresql", name: "PostgreSQL" },
  { slug: "mysql", name: "MySQL" },
  { slug: "mongodb", name: "MongoDB" },
  { slug: "redis", name: "Redis" },
  { slug: "supabase", name: "Supabase" },
  // AI
  { slug: "openai", name: "ChatGPT" },
  { slug: "anthropic", name: "Claude" },
  { slug: "googlegemini", name: "Gemini" },
  { slug: "huggingface", name: "Hugging Face" },
  { slug: "perplexity", name: "Perplexity" },
  { slug: "mistralai", name: "Mistral" },
  { slug: "meta", name: "Meta" },
  // Social / Content
  { slug: "x", name: "X" },
  { slug: "linkedin", name: "LinkedIn" },
  { slug: "reddit", name: "Reddit" },
  { slug: "instagram", name: "Instagram" },
  { slug: "facebook", name: "Facebook" },
  { slug: "youtube", name: "YouTube" },
  { slug: "tiktok", name: "TikTok" },
  { slug: "medium", name: "Medium" },
  { slug: "substack", name: "Substack" },
  // Browsers
  { slug: "googlechrome", name: "Chrome" },
  { slug: "firefox", name: "Firefox" },
  { slug: "safari", name: "Safari" },
  { slug: "brave", name: "Brave" },
  { slug: "microsoftedge", name: "Edge" },
  // Misc
  { slug: "apple", name: "Apple" },
  { slug: "spotify", name: "Spotify" },
  { slug: "stripe", name: "Stripe" },
  { slug: "dropbox", name: "Dropbox" },
  { slug: "googledrive", name: "Google Drive" },
] as const;

const APPS_ROW_1 = COMPATIBLE_APPS.filter((_, i) => i % 3 === 0);
const APPS_ROW_2 = COMPATIBLE_APPS.filter((_, i) => i % 3 === 1);
const APPS_ROW_3 = COMPATIBLE_APPS.filter((_, i) => i % 3 === 2);

const featureIcons = [
  // any app
  <svg key="app" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>,
  // mic
  <svg key="mic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>,
  // globe
  <svg key="globe" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  // translate
  <svg key="translate" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 8l6 6 6-6" />
    <path d="M4 6h16M4 18h7" />
    <path d="M15 15l3 3 3-3" />
    <path d="M18 18V12" />
  </svg>,
  // lock
  <svg key="lock" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
  // monitor
  <svg key="monitor" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h4M7 11h2" />
    <rect x="13" y="7" width="6" height="6" rx="1" />
  </svg>,
];

function DownloadButtons({
  variant = "hero",
}: {
  variant?: "hero" | "cta";
}) {
  const { t } = useI18n();

  const base =
    variant === "hero"
      ? "inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-colors text-white"
      : "inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium transition-colors text-white";

  return (
    <button
      onClick={() => handleDownload()}
      className={base}
      style={{ backgroundColor: "#7BA89C" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5A8C83";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7BA89C";
      }}
    >
      {t.nav.downloadFree}
    </button>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <LandingHeader />
      <main style={{ backgroundColor: "#FFFFFF" }}>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/assets/bisbi.png"
              alt="Bisbi"
              width={96}
              height={96}
              priority
            />
          </div>

          <h1
            className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight"
            style={{ color: "#1A1A18" }}
          >
            {t.hero.headline1}
            <span className="block" style={{ color: "#7BA89C" }}>
              {t.hero.headline2}
            </span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#5C5C57" }}
          >
            {t.hero.subheadline}
          </p>

          <div className="flex justify-center">
            <DownloadButtons variant="hero" />
          </div>

          <p className="mt-5 text-sm" style={{ color: "#A8A8A2" }}>
            {t.hero.freeBadge}
          </p>
        </section>

        {/* Compatible apps marquee */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

          <div
            className="apps-marquee group space-y-6"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
          >
            {[
              { row: APPS_ROW_1, dir: "left", duration: "140s" },
              { row: APPS_ROW_2, dir: "right", duration: "170s" },
              { row: APPS_ROW_3, dir: "left", duration: "200s" },
            ].map(({ row, dir, duration }, idx) => (
              <div key={idx} className="overflow-hidden">
                <div
                  className="flex items-center gap-10 md:gap-12 w-max apps-marquee-track"
                  style={{
                    animation: `apps-marquee-${dir} ${duration} linear infinite`,
                  }}
                >
                  {[...row, ...row].map((app, i) => (
                    <Image
                      key={`${app.slug}-${i}`}
                      src={`/icons/apps/${app.slug}.svg`}
                      alt={app.name}
                      title={app.name}
                      width={36}
                      height={36}
                      className="opacity-50 hover:opacity-100 transition-opacity duration-200 shrink-0"
                      style={{ height: 34, width: "auto" }}
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bloques (cards) sobre el fondo beige */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 pb-12">
          {/* How it works */}
          <section
            id="how-it-works"
            className="rounded-3xl py-16 md:py-20 px-6 sm:px-10 md:px-16 border"
            style={{ borderColor: "#EAE6DC" }}
          >
            <p
              className="text-sm font-medium text-center mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.howItWorks.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-center mb-16"
              style={{ color: "#1A1A18" }}
            >
              {t.howItWorks.title}
            </h2>

            <ProductDemo />
          </section>

          {/* Features */}
          <section
            id="features"
            className="rounded-3xl py-16 md:py-20 px-6 sm:px-10 md:px-16 border"
            style={{ borderColor: "#EAE6DC" }}
          >
            <p
              className="text-sm font-medium text-center mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.features.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-center mb-16"
              style={{ color: "#1A1A18" }}
            >
              {t.features.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#F0EDE6" }}
                >
                  <div
                    className="mb-4 inline-flex rounded-xl p-2"
                    style={{ backgroundColor: "#E6EFED", color: "#7BA89C" }}
                  >
                    {featureIcons[i]}
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "#1A1A18" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5C5C57" }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section
            id="languages"
            className="rounded-3xl py-16 md:py-20 px-6 sm:px-10 md:px-16 text-center border"
            style={{ borderColor: "#EAE6DC" }}
          >
            <p
              className="text-sm font-medium mb-3 uppercase tracking-widest"
              style={{ color: "#7BA89C" }}
            >
              {t.languagesSection.badge}
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold mb-6"
              style={{ color: "#1A1A18" }}
            >
              {t.languagesSection.title}
            </h2>
            <p
              className="text-lg mb-12 max-w-lg mx-auto"
              style={{ color: "#5C5C57" }}
            >
              {t.languagesSection.subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {LANG_CODES.map((code, i) => (
                <div
                  key={code}
                  className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2"
                  style={{ backgroundColor: "#F0EDE6" }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#7BA89C" }}
                  >
                    {code}
                  </span>
                  <span className="text-base font-medium" style={{ color: "#1A1A18" }}>
                    {t.languagesSection.names[i]}
                  </span>
                </div>
              ))}
              <div
                className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2"
                style={{ backgroundColor: "#E6EFED" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#7BA89C" }}
                >
                  {t.languagesSection.moreCount}
                </span>
                <span className="text-base font-medium" style={{ color: "#1A1A18" }}>
                  {t.languagesSection.moreLabel}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Final CTA */}
        <section className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="flex justify-center mb-6">
              <Image src="/owl_head.svg" alt="Bisbi" width={36} height={36} />
            </div>
            <h2
              className="text-3xl md:text-4xl font-semibold mb-4"
              style={{ color: "#1A1A18" }}
            >
              {t.cta.title}
            </h2>
            <p
              className="text-lg mb-10 max-w-md mx-auto"
              style={{ color: "#5C5C57" }}
            >
              {t.cta.description}
            </p>

            <div className="flex justify-center mb-6">
              <DownloadButtons variant="cta" />
            </div>

            <p className="text-sm" style={{ color: "#A8A8A2" }}>
              {t.cta.signInHint}{" "}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="underline underline-offset-2"
                style={{ color: "#7BA89C" }}
              >
                {t.cta.signIn}
              </button>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
