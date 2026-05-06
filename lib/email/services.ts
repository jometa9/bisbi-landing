import { getAppUrl } from "@/lib/app-url";
import { sendEmail } from "./config";
import {
  broadcastEmailTemplate,
  passwordResetEmailTemplate,
  richContentEmailTemplate,
  subscriptionChangeEmailTemplate,
  versionUpdateEmailTemplate,
  welcomeEmailTemplate,
  welcomeWithSubscriptionTemplate,
  accountConnectionErrorEmailTemplate,
} from "./templates";

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

export async function sendWelcomeEmail({
  email,
  name,
  loginUrl = getAppUrl(),
}: {
  email: string;
  name: string;
  loginUrl?: string;
}) {
  const { html, text } = await welcomeEmailTemplate({
    name,
    loginUrl,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject: "Welcome to Bisbi!",
        html,
        text,
      }),
    3,
    500,
    `Welcome email to ${email}`
  );
}

export async function sendWelcomeWithSubscriptionEmail({
  email,
  name,
  password,
  planName,
  expiryDate,
  loginUrl = `${getAppUrl()}/sign-in`,
}: {
  email: string;
  name: string;
  password: string;
  planName: string;
  expiryDate?: string;
  loginUrl?: string;
}) {
  const { html, text } = await welcomeWithSubscriptionTemplate({
    name,
    email,
    password,
    planName,
    expiryDate,
    loginUrl,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject: "Welcome to Bisbi!",
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
}: {
  email: string;
  name: string;
  planName: string;
  status: string;
  expiryDate?: string;
  dashboardUrl?: string;
}) {
  try {
    if (!email) {
      throw new Error("Email address is missing");
    }

    const { html, text } = await subscriptionChangeEmailTemplate({
      name,
      plan: planName,
      status,
      renewalDate: expiryDate,
      dashboardUrl,
    });

    let subject = "Your Bisbi subscription has been updated";
    if (status === "active") {
      subject = "Your Bisbi subscription is active";
    } else if (status === "trialing") {
      subject = "Your Bisbi trial has started";
    } else if (status === "canceled") {
      subject = "Your Bisbi subscription has been canceled";
    } else if (status === "canceling") {
      subject = "Your Bisbi subscription cancellation has been scheduled";
    } else if (status === "plan_changed") {
      subject = "Your Bisbi plan has been changed";
    } else if (status === "unpaid") {
      subject = "There was a payment issue with your Bisbi subscription";
    } else if (status === "expired") {
      subject = "Your Bisbi subscription has expired";
    }

    return await withRetry(
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
  } catch (error) {
    throw error;
  }
}

export async function sendPasswordResetEmail({
  email,
  name,
  token,
  expiryMinutes = 60,
}: {
  email: string;
  name: string;
  token: string;
  expiryMinutes?: number;
}) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  const { html, text } = await passwordResetEmailTemplate({
    name,
    resetUrl,
    expiryMinutes,
  });

  return sendEmail({
    to: email,
    subject: "Reset password for your Bisbi account",
    html,
    text,
  });
}

export async function sendVersionUpdateEmail({
  email,
  name,
  currentVersion,
  newVersion,
  releaseNotes,
  downloadUrl,
  isCritical = false,
}: {
  email: string;
  name: string;
  currentVersion: string;
  newVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  isCritical?: boolean;
}) {
  const { html, text } = await versionUpdateEmailTemplate({
    name,
    currentVersion,
    newVersion,
    releaseNotes,
    downloadUrl,
    isCritical,
  });

  const subject = isCritical
    ? `[CRITICAL UPDATE] New version ${newVersion} available`
    : `New version ${newVersion} available for Bisbi`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
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
    subject: subject,
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
  try {
    const { html, text } = await richContentEmailTemplate({
      name,
      subject,
      markdownContent,
    });

    const result = await withRetry(
      () => {
        return sendEmail({
          to: email,
          subject,
          html,
          text,
        });
      },
      3,
      500,
      `Rich content email to ${email}`
    );

    return result;
  } catch (error) {
    throw error;
  }
}



export async function sendAccountConnectionErrorEmail({
  email,
  name,
  dashboardUrl,
}: {
  email: string;
  name: string;
  dashboardUrl?: string;
}) {
  const { html, text } = await accountConnectionErrorEmailTemplate({
    name,
    dashboardUrl,
  });

  return withRetry(
    () =>
      sendEmail({
        to: email,
        subject: "Account connection error",
        html,
        text,
      }),
    3,
    500,
    `Account connection error email to ${email}`
  );
}
