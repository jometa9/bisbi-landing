import { getAppUrl } from "@/lib/app-url";
import { sendEmail } from "./config";
import {
  broadcastEmailTemplate,
  richContentEmailTemplate,
  subscriptionChangeEmailTemplate,
  welcomeWithSubscriptionTemplate,
} from "./templates";
import { DEFAULT_EMAIL_LANG, type EmailLang } from "./translations";

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 500,
  name = "Operation"
): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 1.5, name);
  }
}

export async function sendWelcomeWithSubscriptionEmail({
  email,
  name,
  password,
  planName,
  expiryDate,
  loginUrl = `${getAppUrl()}/sign-in`,
  lang = DEFAULT_EMAIL_LANG,
}: {
  email: string;
  name: string;
  password: string;
  planName: string;
  expiryDate?: string;
  loginUrl?: string;
  lang?: EmailLang;
}) {
  const { html, text, subject } = await welcomeWithSubscriptionTemplate({
    name,
    email,
    password,
    planName,
    expiryDate,
    loginUrl,
    lang,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject,
        html,
        text,
      }),
    3,
    500,
    `Welcome with subscription email to ${email}`
  );
}

export async function sendSubscriptionChangeEmail({
  email,
  name,
  planName,
  status,
  expiryDate,
  dashboardUrl = `${getAppUrl()}/dashboard`,
  lang = DEFAULT_EMAIL_LANG,
}: {
  email: string;
  name: string;
  planName: string;
  status: string;
  expiryDate?: string;
  dashboardUrl?: string;
  lang?: EmailLang;
}) {
  if (!email) {
    throw new Error("Email address is missing");
  }

  const { html, text, subject } = await subscriptionChangeEmailTemplate({
    name,
    plan: planName,
    status,
    renewalDate: expiryDate,
    dashboardUrl,
    lang,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject,
        html,
        text,
      }),
    3,
    500,
    `Subscription email to ${email}`
  );
}

export async function sendBroadcastEmail({
  email,
  name,
  subject,
  message,
  isImportant = false,
}: {
  email: string;
  name: string;
  subject: string;
  message: string;
  isImportant?: boolean;
}) {
  const { html, text } = await broadcastEmailTemplate({
    name,
    subject,
    message,
    isImportant,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

export async function sendRichContentEmail({
  email,
  name,
  subject,
  markdownContent,
}: {
  email: string;
  name: string;
  subject: string;
  markdownContent: string;
}) {
  const { html, text } = await richContentEmailTemplate({
    name,
    subject,
    markdownContent,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject,
        html,
        text,
      }),
    3,
    500,
    `Rich content email to ${email}`
  );
}
