"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en, type LandingTranslations } from "./locales/en";
import { es } from "./locales/es";
import { zh } from "./locales/zh";
import { hi } from "./locales/hi";
import { ar } from "./locales/ar";

export const SUPPORTED_LANGS = ["en", "es", "zh", "hi", "ar"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  es: "ES",
  zh: "中文",
  hi: "हि",
  ar: "ع",
};

const RTL: ReadonlySet<Lang> = new Set(["ar"]);

const DICTIONARIES: Record<Lang, LandingTranslations> = {
  en,
  es,
  zh,
  hi,
  ar,
};

const STORAGE_KEY = "bisbi-lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored))
    return stored;
  const primary = (navigator.language || "es").split("-")[0].toLowerCase();
  if ((SUPPORTED_LANGS as readonly string[]).includes(primary))
    return primary as Lang;
  return "es";
}

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: LandingTranslations;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const dir: "ltr" | "rtl" = RTL.has(lang) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useMemo(() => DICTIONARIES[lang] ?? en, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({ lang, setLang, t, dir }),
    [lang, setLang, t, dir]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
