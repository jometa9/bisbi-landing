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
        subject: "¡Bienvenido a Bisbi!",
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
        subject: "¡Bienvenido a Bisbi!",
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

    let subject = "Tu suscripción de Bisbi se actualizó";
    if (status === "active") {
      subject = "Tu suscripción de Bisbi está activa";
    } else if (status === "trialing") {
      subject = "Empezó tu prueba de Bisbi";
    } else if (status === "canceled") {
      subject = "Tu suscripción de Bisbi fue cancelada";
    } else if (status === "canceling") {
      subject = "Se programó la cancelación de tu suscripción de Bisbi";
    } else if (status === "plan_changed") {
      subject = "Tu plan de Bisbi se cambió";
    } else if (status === "unpaid") {
      subject = "Hubo un problema con el pago de tu suscripción de Bisbi";
    } else if (status === "expired") {
      subject = "Tu suscripción de Bisbi expiró";
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
    subject: "Restablecé la contraseña de tu cuenta de Bisbi",
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
    ? `[ACTUALIZACIÓN CRÍTICA] Nueva versión ${newVersion} disponible`
    : `Nueva versión ${newVersion} disponible para Bisbi`;

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
        subject: "Error de conexión de cuenta",
        html,
        text,
      }),
    3,
    500,
    `Account connection error email to ${email}`
  );
}
