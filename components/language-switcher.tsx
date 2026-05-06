"use client";

import { SUPPORTED_LANGS, LANG_LABELS, useI18n, type Lang } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
        style={{
          backgroundColor: "#E6EFED",
          color: "#5C5C57",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#D9E8E5";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#E6EFED";
        }}
      >
        {LANG_LABELS[lang]}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 rounded-2xl shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E8E5",
            minWidth: "8rem",
            right: 0,
          }}
        >
          {SUPPORTED_LANGS.map((l: Lang) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between cursor-pointer"
              style={{
                backgroundColor: l === lang ? "#E6EFED" : "transparent",
                color: l === lang ? "#7BA89C" : "#5C5C57",
              }}
              onMouseEnter={(e) => {
                if (l !== lang)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#F0EDE6";
              }}
              onMouseLeave={(e) => {
                if (l !== lang)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              <span>{LANG_LABELS[l]}</span>
              {l === lang && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
