import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const TEMPLATES_DIR = path.resolve(process.cwd(), "email-templates");

const templateCache: Record<string, string> = {};

export async function loadTemplate(templateName: string): Promise<string> {
  if (templateName !== "base") {
    throw new Error(
      `Template "${templateName}" not found. Only "base" template is supported.`
    );
  }

  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Template file "${filePath}" not found. Please create email-templates/base.html`
    );
  }

  const bodyContent = await readFile(filePath, "utf8");

  const fullTemplate = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{subject}}</title>
  </head>
  <body style="font-family: Arial, sans-serif;">
    ${bodyContent}
  </body>
</html>`;

  templateCache[templateName] = fullTemplate;

  return fullTemplate;
}

export async function saveTemplate(
  templateName: string,
  content: string
): Promise<void> {
  try {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }

    const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
    await writeFile(filePath, content, "utf8");

    templateCache[templateName] = content;
  } catch (error) {
    throw error;
  }
}

export function replaceTemplateVariables(
  template: string,
  data: Record<string, string | number | undefined>
): string {
  let result = template;

  const ifElseRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g;
  result = result.replace(
    ifElseRegex,
    (match, condition, trueContent, falseContent) => {
      const value = condition
        .split(".")
        .reduce(
          (obj: Record<string, string | number | undefined>, key: string) =>
            obj?.[key],
          data
        );
      return value ? trueContent : falseContent;
    }
  );

  const ifRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifRegex, (match, condition, content) => {
    const value = condition
      .split(".")
      .reduce(
        (obj: Record<string, string | number | undefined>, key: string) =>
          obj?.[key],
        data
      );
    return value ? content : "";
  });

  const tripleVarRegex = /{{{([^#/][^}]*?)}}}/g;
  result = result.replace(tripleVarRegex, (match, key) => {
    const value = key
      .split(".")
      .reduce(
        (obj: Record<string, string | number | undefined>, k: string) =>
          obj?.[k],
        data
      );
    return value !== undefined ? String(value) : match;
  });

  const varRegex = /{{([^#/][^}]*)}}/g;
  result = result.replace(varRegex, (match, key) => {
    const value = key
      .split(".")
      .reduce(
        (obj: Record<string, string | number | undefined>, k: string) =>
          obj?.[k],
        data
      );
    return value !== undefined ? String(value) : match;
  });

  return result;
}
