"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useI18n } from "@/lib/i18n";
import {
  AVAILABLE_LEGAL_LANGS,
  LEGAL_DOC_IDS,
  LEGAL_I18N,
  type LegalDocId,
  type LegalLang,
} from "./i18n";

interface Props {
  docsByLang: Record<LegalLang, Record<LegalDocId, string>>;
}

export function LegalContent({ docsByLang }: Props) {
  const { lang } = useI18n();
  const effectiveLang: LegalLang = (AVAILABLE_LEGAL_LANGS as readonly string[]).includes(lang)
    ? (lang as LegalLang)
    : "es";

  const t = LEGAL_I18N[effectiveLang];
  const docs = docsByLang[effectiveLang];

  return (
    <main className="pt-25 pb-20" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="px-6 w-full max-w-6xl mx-auto">
        <div className="w-full space-y-4 pb-8">
          <div className="max-w-5xl pb-0">
            <h1
              className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight"
              style={{ color: "#1A1A18" }}
            >
              {t.title}
            </h1>
            <p
              className="mt-3 text-lg md:text-xl max-w-2xl leading-relaxed"
              style={{ color: "#5C5C57" }}
            >
              {t.subtitle}
            </p>
            <p className="mt-2 text-sm" style={{ color: "#A8A8A2" }}>
              {t.updatedLabel}: {t.updatedValue}
            </p>
          </div>

          <div className="max-w-5xl my-6">
            <h2
              className="text-xl font-semibold mb-4 tracking-tight"
              style={{ color: "#1A1A18" }}
            >
              {t.toc}
            </h2>
            <ul className="space-y-2 pl-3">
              {LEGAL_DOC_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="hover:underline transition-colors"
                    style={{ color: "#7BA89C" }}
                  >
                    {t.docs[id]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <hr className="my-8 max-w-5xl" style={{ borderColor: "#E8E6E1" }} />

          {LEGAL_DOC_IDS.map((id, index) => (
            <div key={id}>
              {index > 0 && (
                <hr className="my-8 max-w-5xl" style={{ borderColor: "#E8E6E1" }} />
              )}
              <div id={id} className="scroll-mt-20 max-w-5xl">
                <MarkdownRenderer content={docs[id] || ""} />
              </div>
            </div>
          ))}

          <hr className="my-8 max-w-5xl" style={{ borderColor: "#E8E6E1" }} />
          <div className="max-w-5xl">
            <h2
              className="text-2xl font-semibold mb-4 tracking-tight"
              style={{ color: "#1A1A18" }}
            >
              {t.contactTitle}
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: "#5C5C57" }}>
              {t.contactBody}
            </p>
            <div className="space-y-2 leading-relaxed" style={{ color: "#5C5C57" }}>
              <p>
                <strong style={{ color: "#1A1A18" }}>{t.emailLabel}</strong> hello@bisbi.io
              </p>
              <p>
                <strong style={{ color: "#1A1A18" }}>{t.siteLabel}</strong> https://bisbi.io
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
