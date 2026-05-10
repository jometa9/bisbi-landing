export const AVAILABLE_LEGAL_LANGS = ["es", "en"] as const;
export type LegalLang = (typeof AVAILABLE_LEGAL_LANGS)[number];

export const LEGAL_DOC_IDS = [
  "cookies",
  "privacy",
  "terms",
  "billing",
  "complaints",
  "refunds",
  "disclaimer",
] as const;
export type LegalDocId = (typeof LEGAL_DOC_IDS)[number];

interface LegalMetadata {
  title: string;
  description: string;
  ogDescription: string;
  twitterDescription: string;
  keywords: string[];
}

interface LegalChrome {
  title: string;
  subtitle: string;
  updatedLabel: string;
  updatedValue: string;
  toc: string;
  contactTitle: string;
  contactBody: string;
  emailLabel: string;
  siteLabel: string;
  docs: Record<LegalDocId, string>;
  metadata: LegalMetadata;
}

export const LEGAL_I18N: Record<LegalLang, LegalChrome> = {
  es: {
    title: "Información Legal",
    subtitle:
      "Nuestros términos y condiciones, política de privacidad y demás documentación legal — todo lo que necesitás saber para usar Bisbi.",
    updatedLabel: "Documentos actualizados",
    updatedValue: "Mayo 2026",
    toc: "Tabla de contenidos",
    contactTitle: "Contactanos",
    contactBody: "¿Tenés preguntas sobre nuestras políticas legales?",
    emailLabel: "Email:",
    siteLabel: "Sitio web:",
    docs: {
      cookies: "Política de Cookies",
      privacy: "Política de Privacidad",
      terms: "Términos de Uso",
      billing: "Política de Facturación",
      complaints: "Política de Reclamos",
      refunds: "Política de Reembolsos",
      disclaimer: "Aviso Legal",
    },
    metadata: {
      title: "Información Legal — Bisbi",
      description:
        "Documentación legal de Bisbi: Política de Privacidad, Términos de Uso, Política de Cookies, Facturación, Reclamos, Política de Reembolsos y Aviso Legal.",
      ogDescription:
        "Política de Privacidad, Términos de Uso, Política de Cookies, Facturación, Reclamos, Reembolsos y Aviso Legal de Bisbi.",
      twitterDescription:
        "Política de Privacidad, Términos de Uso, Política de Cookies y más para Bisbi.",
      keywords: [
        "Bisbi legal",
        "Bisbi política de privacidad",
        "Bisbi términos de uso",
        "Bisbi política de reembolsos",
      ],
    },
  },
  en: {
    title: "Legal Information",
    subtitle:
      "Our terms and conditions, privacy policy and other legal documentation — everything you need to know to use Bisbi.",
    updatedLabel: "Documents updated",
    updatedValue: "May 2026",
    toc: "Table of contents",
    contactTitle: "Contact us",
    contactBody: "Do you have questions about our legal policies?",
    emailLabel: "Email:",
    siteLabel: "Website:",
    docs: {
      cookies: "Cookie Policy",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      billing: "Billing Policy",
      complaints: "Complaints Policy",
      refunds: "Refund Policy",
      disclaimer: "Legal Disclaimer",
    },
    metadata: {
      title: "Legal Information — Bisbi",
      description:
        "Bisbi's legal documentation: Privacy Policy, Terms of Use, Cookie Policy, Billing, Complaints, Refund Policy and Legal Disclaimer.",
      ogDescription:
        "Bisbi's Privacy Policy, Terms of Use, Cookie Policy, Billing, Complaints, Refunds and Legal Disclaimer.",
      twitterDescription:
        "Bisbi's Privacy Policy, Terms of Use, Cookie Policy and more.",
      keywords: [
        "Bisbi legal",
        "Bisbi privacy policy",
        "Bisbi terms of use",
        "Bisbi refund policy",
      ],
    },
  },
};
