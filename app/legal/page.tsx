import { LandingHeader } from "@/components/landing/landing-header";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { readFileSync } from "fs";
import { join } from "path";
import { LegalContent } from "./legal-content";
import {
  AVAILABLE_LEGAL_LANGS,
  LEGAL_DOC_IDS,
  LEGAL_I18N,
  type LegalDocId,
  type LegalLang,
} from "./i18n";

async function detectLangFromHeaders(): Promise<LegalLang> {
  const h = await headers();
  const accept = h.get("accept-language") || "";
  const candidates = accept
    .split(",")
    .map((s) => s.split(";")[0].trim().split("-")[0].toLowerCase())
    .filter(Boolean);
  for (const c of candidates) {
    if ((AVAILABLE_LEGAL_LANGS as readonly string[]).includes(c)) {
      return c as LegalLang;
    }
  }
  return "es";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLangFromHeaders();
  const m = LEGAL_I18N[lang].metadata;

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: {
      canonical: "/legal",
      languages: {
        es: "/legal",
        en: "/legal",
      },
    },
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      url: "/legal",
      type: "website",
      locale: lang === "en" ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.twitterDescription,
    },
  };
}

function loadLang(lang: LegalLang): Record<LegalDocId, string> {
  const result = {} as Record<LegalDocId, string>;
  for (const id of LEGAL_DOC_IDS) {
    try {
      const filePath = join(process.cwd(), "public", "legal", lang, `${id}.md`);
      result[id] = readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading legal/${lang}/${id}.md:`, error);
      result[id] = "";
    }
  }
  return result;
}

export default function LegalPage() {
  const docsByLang = {} as Record<LegalLang, Record<LegalDocId, string>>;
  for (const lang of AVAILABLE_LEGAL_LANGS) {
    docsByLang[lang] = loadLang(lang);
  }

  return (
    <>
      <LandingHeader />
      <LegalContent docsByLang={docsByLang} />
    </>
  );
}
