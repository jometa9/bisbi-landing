import { LandingHeader } from "@/components/landing/landing-header";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  description:
    "Documentación legal de Bisbi: Política de Privacidad, Términos de Uso, Política de Cookies, Facturación, Reclamos, Política de Reembolsos y Aviso Legal. Leé nuestras políticas.",
  keywords: [
    "Bisbi legal",
    "Bisbi política de privacidad",
    "Bisbi términos de uso",
    "Bisbi política de reembolsos",
  ],
  alternates: { canonical: "/legal" },
  openGraph: {
    description:
      "Política de Privacidad, Términos de Uso, Política de Cookies, Facturación, Reclamos, Reembolsos y Aviso Legal de Bisbi.",
    url: "/legal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    description: "Política de Privacidad, Términos de Uso, Política de Cookies y más para Bisbi.",
  },
};

export default function LegalPage() {
  const documents = [
    { id: "cookies", title: "Política de Cookies", filename: "cookies.md" },
    { id: "privacy", title: "Política de Privacidad", filename: "privacy.md" },
    { id: "terms", title: "Términos de Uso", filename: "terms.md" },
    { id: "billing", title: "Política de Facturación", filename: "billing.md" },
    { id: "complaints", title: "Política de Reclamos", filename: "complaints.md" },
    { id: "refunds", title: "Política de Reembolsos", filename: "refunds.md" },
    { id: "disclaimer", title: "Aviso Legal", filename: "disclaimer.md" },
  ];

  const contents: Record<string, string> = {};

  for (const doc of documents) {
    try {
      const filePath = join(process.cwd(), "public", doc.filename);
      contents[doc.id] = readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading ${doc.filename}:`, error);
      contents[doc.id] = `# ${doc.title}\n\nNo se encontró el archivo \`${doc.filename}\`.`;
    }
  }

  const legalDocsUpdated = "Mayo 2026";

  return (
    <>
      <LandingHeader />
      <main className="pt-25 pb-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="px-6 w-full max-w-5xl mx-auto">
          <div className="w-full space-y-4 pb-8">
            <div className="max-w-4xl pb-0">
              <h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight"
                style={{ color: "#1A1A18" }}
              >
                Información Legal
              </h1>
              <p
                className="mt-3 text-lg md:text-xl max-w-2xl leading-relaxed"
                style={{ color: "#5C5C57" }}
              >
                Nuestros términos y condiciones, política de privacidad y demás documentación legal —
                todo lo que necesitás saber para usar Bisbi.
              </p>
              <p className="mt-2 text-sm" style={{ color: "#A8A8A2" }}>
                Documentos actualizados: {legalDocsUpdated}
              </p>
            </div>

            <div className="max-w-4xl my-6">
              <h2
                className="text-xl font-semibold mb-4 tracking-tight"
                style={{ color: "#1A1A18" }}
              >
                Tabla de contenidos
              </h2>
              <ul className="space-y-2 pl-3">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`#${doc.id}`}
                      className="hover:underline transition-colors"
                      style={{ color: "#7BA89C" }}
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="my-8 max-w-4xl" style={{ borderColor: "#E8E6E1" }} />

            {documents.map((doc, index) => (
              <div key={doc.id}>
                {index > 0 && (
                  <hr className="my-8 max-w-4xl" style={{ borderColor: "#E8E6E1" }} />
                )}
                <div id={doc.id} className="scroll-mt-20 max-w-4xl">
                  <MarkdownRenderer content={contents[doc.id] || ""} />
                </div>
              </div>
            ))}

            <hr className="my-8 max-w-4xl" style={{ borderColor: "#E8E6E1" }} />
            <div className="max-w-4xl">
              <h2
                className="text-2xl font-semibold mb-4 tracking-tight"
                style={{ color: "#1A1A18" }}
              >
                Contactanos
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#5C5C57" }}>
                ¿Tenés preguntas sobre nuestras políticas legales?
              </p>
              <div className="space-y-2 leading-relaxed" style={{ color: "#5C5C57" }}>
                <p>
                  <strong style={{ color: "#1A1A18" }}>Email:</strong> hello@bisbi.io
                </p>
                <p>
                  <strong style={{ color: "#1A1A18" }}>Sitio web:</strong> https://bisbi.io
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
