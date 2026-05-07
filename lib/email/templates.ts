import { getAppUrl } from "@/lib/app-url";
import { marked } from "marked";
import { loadTemplate, replaceTemplateVariables } from "./template-loader";
import {
  DEFAULT_EMAIL_LANG,
  type EmailLang,
  subscriptionChangeStrings,
  welcomeWithSubscriptionStrings,
} from "./translations";

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownToHtml(markdown: string): string {
  try {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const result = marked.parse(markdown);
    return typeof result === "string" ? result : result.toString();
  } catch {
    return `<pre>${markdown}</pre>`;
  }
}

export async function welcomeWithSubscriptionTemplate(data: {
  name: string;
  email: string;
  password: string;
  planName: string;
  expiryDate?: string;
  loginUrl: string;
  lang?: EmailLang;
}) {
  const lang = data.lang ?? DEFAULT_EMAIL_LANG;
  const strings = welcomeWithSubscriptionStrings(lang);
  const planLabel =
    data.planName.charAt(0).toUpperCase() + data.planName.slice(1);

  const lines = [
    strings.greeting(data.name),
    "",
    strings.body(planLabel, data.expiryDate),
    "",
    strings.passwordLine(data.password),
  ];

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: strings.subject,
    name: data.name,
    message: lines.join("\n").replace(/\n/g, "<br>"),
    buttonUrl: data.loginUrl,
    buttonText: strings.buttonText,
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
    subject: strings.subject,
  };
}

export async function subscriptionChangeEmailTemplate(data: {
  name: string;
  plan: string;
  status: string;
  renewalDate?: string;
  dashboardUrl?: string;
  lang?: EmailLang;
}) {
  const lang = data.lang ?? DEFAULT_EMAIL_LANG;
  const strings = subscriptionChangeStrings(lang);

  let processedPlanName = data.plan;
  if (
    !processedPlanName ||
    processedPlanName.toLowerCase() === "none" ||
    processedPlanName.toLowerCase() === "unknown plan"
  ) {
    processedPlanName = strings.planFreeFallback;
  } else if (processedPlanName.toLowerCase() === "admin_assigned") {
    processedPlanName = strings.planAdminAssigned;
  } else {
    processedPlanName =
      processedPlanName.charAt(0).toUpperCase() +
      processedPlanName.slice(1).toLowerCase();
  }

  const statusMessage = strings.statusMessage(data.status, data.renewalDate);

  const dashboardUrl = data.dashboardUrl || `${getAppUrl()}/dashboard`;

  const subject = strings.subjectByStatus[data.status] ?? strings.defaultSubject;

  const lines = [
    strings.greeting(data.name),
    "",
    strings.intro,
    "",
    statusMessage,
  ];

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: lines.join("\n").replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: strings.buttonText,
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
    subject,
  };
}

export async function broadcastEmailTemplate(data: {
  name: string;
  subject: string;
  message: string;
  isImportant?: boolean;
}) {
  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: data.subject,
    name: data.name,
    message: data.message,
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function richContentEmailTemplate(data: {
  name: string;
  subject: string;
  markdownContent: string;
}) {
  const template = await loadTemplate("base");
  const richContent = markdownToHtml(data.markdownContent);
  const html = replaceTemplateVariables(template, {
    subject: data.subject,
    name: data.name,
    richContent,
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}
