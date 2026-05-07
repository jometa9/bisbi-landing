import { getAppUrl } from "@/lib/app-url";
import { marked } from "marked";
import { loadTemplate, replaceTemplateVariables } from "./template-loader";

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

export async function welcomeEmailTemplate(data: {
  name: string;
  loginUrl: string;
}) {
  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: "¡Bienvenido a Bisbi!",
    name: data.name,
    message: "Nos alegra mucho tenerte con nosotros.",
    buttonUrl: data.loginUrl,
    buttonText: "Acceder a tu cuenta",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function welcomeWithSubscriptionTemplate(data: {
  name: string;
  email: string;
  password: string;
  planName: string;
  expiryDate?: string;
  loginUrl: string;
}) {
  const planLabel =
    data.planName.charAt(0).toUpperCase() + data.planName.slice(1);

  let message = `Se creó una cuenta para vos en Bisbi con el plan ${planLabel}${data.expiryDate ? `, válida hasta ${data.expiryDate}` : ""}.`;
  message += `\n\nTu contraseña es ${data.password}. También podés iniciar sesión con Google usando este mismo email.`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: "Bienvenido a Bisbi",
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: data.loginUrl,
    buttonText: "Acceder a tu cuenta",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function subscriptionChangeEmailTemplate(data: {
  name: string;
  plan: string;
  status: string;
  renewalDate?: string;
  dashboardUrl?: string;
}) {
  let processedPlanName = data.plan;

  if (
    !processedPlanName ||
    processedPlanName.toLowerCase() === "none" ||
    processedPlanName.toLowerCase() === "unknown plan"
  ) {
    processedPlanName = "Gratis";
  } else if (processedPlanName.toLowerCase() === "admin_assigned") {
    processedPlanName = "Asignado por administrador";
  } else {
    processedPlanName =
      processedPlanName.charAt(0).toUpperCase() +
      processedPlanName.slice(1).toLowerCase();
  }

  let processedStatus = data.status;
  if (processedStatus) {
    if (processedStatus.toLowerCase() === "past_due") {
      processedStatus = "Pago vencido";
    } else if (processedStatus.toLowerCase() === "incomplete_expired") {
      processedStatus = "Expirada por incompleta";
    } else if (processedStatus.toLowerCase() === "plan_changed") {
      processedStatus = "Plan cambiado";
    } else if (processedStatus.toLowerCase() === "canceling") {
      processedStatus = "Cancelación programada";
    } else {
      processedStatus =
        processedStatus.charAt(0).toUpperCase() +
        processedStatus.slice(1).toLowerCase();
    }
  }

  let statusMessage = "";
  switch (data.status) {
    case "active":
      statusMessage = "Tu suscripción está activa y funcionando correctamente.";
      break;
    case "canceled":
      statusMessage =
        "Tu suscripción fue cancelada. Podés volver a suscribirte cuando quieras desde tu panel.";
      break;
    case "canceling":
      statusMessage = `Se programó la cancelación de tu suscripción. Vas a seguir teniendo acceso hasta ${data.renewalDate || "el final de tu período de facturación"}. Después de esa fecha, tu suscripción se va a cancelar.`;
      break;
    case "plan_changed":
      statusMessage =
        "Tu plan se cambió correctamente. Tu nuevo plan ya está activo.";
      break;
    case "trialing":
      statusMessage = "Estás en un período de prueba.";
      break;
    case "unpaid":
      statusMessage =
        "Hubo un problema con el pago de tu suscripción. Por favor, actualizá tu método de pago.";
      break;
    case "past_due":
      statusMessage =
        "El pago de tu suscripción está vencido. Por favor, actualizá tu método de pago.";
      break;
    case "incomplete":
      statusMessage =
        "La configuración de tu suscripción está incompleta. Por favor, completá el proceso de pago.";
      break;
    case "incomplete_expired":
      statusMessage =
        "La configuración de tu suscripción expiró. Por favor, reiniciá el proceso de suscripción.";
      break;
    case "expired":
      statusMessage =
        "Tu suscripción expiró. Volvé a suscribirte desde tu panel para recuperar el acceso.";
      break;
    default:
      statusMessage = `El estado actual de tu suscripción es: ${data.status}`;
  }

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard`;

  let message = `Te avisamos sobre un cambio en tu suscripción de Bisbi.`;

  message += `\n\n${statusMessage}`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: "Actualización de tu suscripción",
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver detalles en tu cuenta",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function passwordResetEmailTemplate(data: {
  name: string;
  resetUrl: string;
  expiryMinutes: number;
}) {
  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject: "Restablecer contraseña",
    name: data.name,
    message: `Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste vos, podés ignorar este email. Este enlace expira en ${data.expiryMinutes} minutos.`,
    buttonUrl: data.resetUrl,
    buttonText: "Restablecer contraseña",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function versionUpdateEmailTemplate(data: {
  name: string;
  currentVersion: string;
  newVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  isCritical?: boolean;
}) {
  let message = `Hay una nueva versión de Bisbi disponible.\n\nActual: ${data.currentVersion}\nNueva: ${data.newVersion}`;

  if (data.isCritical) {
    message = `🚨 ACTUALIZACIÓN CRÍTICA: ${message}\n\nEsta es una actualización crítica que resuelve problemas importantes de seguridad o estabilidad. Por favor, actualizá lo antes posible.`;
  }

  if (data.releaseNotes) {
    message += `\n\nNovedades:\n${data.releaseNotes}`;
  }

  const template = await loadTemplate("base");
  const templateData: Record<string, string | number> = {
    subject: data.isCritical
      ? `[ACTUALIZACIÓN CRÍTICA] Nueva versión ${data.newVersion} disponible`
      : `Nueva versión ${data.newVersion} disponible`,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    year: new Date().getFullYear(),
  };

  if (data.downloadUrl) {
    templateData.buttonUrl = data.downloadUrl;
    templateData.buttonText = "Descargar actualización";
  }

  const html = replaceTemplateVariables(template, templateData);

  return {
    html,
    text: stripHtml(html),
  };
}

export async function broadcastEmailTemplate(data: {
  name: string;
  subject: string;
  message: string;
  isImportant?: boolean;
}) {
  const template = await loadTemplate("base");
  const messageText = data.message;
  const html = replaceTemplateVariables(template, {
    subject: data.subject,
    name: data.name,
    message: messageText,
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
  try {
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
  } catch (error) {
    throw error;
  }
}

export async function payoutProcessedEmailTemplate(data: {
  name: string;
  amount: number;
  cryptocurrency: string;
  status: "completed" | "canceled";
  dashboardUrl?: string;
}) {
  const isCompleted = data.status === "completed";
  const subject = isCompleted
    ? "Tu pago fue procesado"
    : "Tu solicitud de pago fue cancelada";

  let message = "";
  if (isCompleted) {
    message = `Tu solicitud de pago fue procesada y enviada a tu wallet.\n\nMonto: $${data.amount.toFixed(2)}\n\nLos fondos van a aparecer en tu wallet en breve. Si tenés alguna duda, contactá a soporte.`;
  } else {
    message = `Tu solicitud de pago fue cancelada.\n\nMonto: $${data.amount.toFixed(2)}\n\nSi tenés alguna duda o querés solicitar un nuevo pago, contactá a soporte o entrá a tu panel.`;
  }

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/affiliates`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver panel",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateApplicationReceivedEmailTemplate(data: {
  name: string;
  code: string;
}) {
  const subject = "Recibimos tu solicitud de afiliado";
  const message = `Recibimos tu solicitud de afiliado y nos entusiasma revisarla.\n\nCódigo solicitado: ${data.code}\n\nNuestro equipo va a revisar tu solicitud y te contesta pronto. Generalmente revisamos las solicitudes en 1 o 2 días hábiles.\n\nUna vez aprobada, vas a poder:\n• Ganar 20% de comisión en cada compra hecha con tu código\n• Hacer seguimiento de tus ingresos y referidos en tu panel\n• Solicitar pagos en criptomonedas\n\nTe vamos a notificar por email cuando se haya revisado tu solicitud.\n\n¡Gracias por tu interés en nuestro programa de afiliados!`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateApprovalEmailTemplate(data: {
  name: string;
  code: string;
  dashboardUrl?: string;
}) {
  const subject = "¡Tu solicitud de afiliado fue aprobada!";
  const message = `Tu solicitud de afiliado fue aprobada. Ya podés empezar a ganar comisiones compartiendo tu código de afiliado único.\n\nTu código de afiliado: ${data.code}\n\nCompartí este código con tu audiencia y ganá 20% de comisión en cada compra realizada con tu código.\n\nPodés ver tu panel de afiliado, hacer seguimiento de tus ingresos y solicitar pagos cuando quieras.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/affiliates`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver panel",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateRejectionEmailTemplate(data: {
  name: string;
  reason: string;
}) {
  const subject = "Actualización de tu solicitud de afiliado";
  const message = `Gracias por tu interés en nuestro programa de afiliados. Lamentablemente, no podemos aprobar tu solicitud en este momento.\n\nMotivo: ${data.reason}\n\nSi tenés alguna duda o querés volver a postularte en el futuro, no dudes en contactarnos.\n\nGracias por tu interés.`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateApplicationAdminNotificationTemplate(data: {
  applicantName: string;
  applicantEmail: string;
  code: string;
  message?: string | null;
  socialMedia?: string | null;
  dashboardUrl?: string;
}) {
  const subject = "Nueva solicitud de afiliado recibida";
  let message = `Se envió una nueva solicitud de afiliado.\n\nSolicitante: ${data.applicantName} (${data.applicantEmail})\nCódigo solicitado: ${data.code}`;

  if (data.message) {
    message += `\n\nMensaje: ${data.message}`;
  }

  if (data.socialMedia) {
    message += `\n\nRedes sociales: ${data.socialMedia}`;
  }

  message += `\n\nPor favor, revisá y aprobá o rechazá esta solicitud.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/admin/affiliates`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: "Admin",
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Revisar solicitud",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function payoutRequestCreatedEmailTemplate(data: {
  name: string;
  amount: number;
  dashboardUrl?: string;
}) {
  const subject = "Solicitud de pago enviada";
  const message = `Tu solicitud de pago se envió correctamente.\n\nMonto: $${data.amount.toFixed(2)}\n\nVamos a revisar tu solicitud y procesarla lo antes posible. Vas a recibir una notificación por email cuando se procese tu pago.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/affiliates/payouts`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver solicitudes de pago",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function payoutRequestAdminNotificationTemplate(data: {
  affiliateName: string;
  affiliateEmail: string;
  affiliateCode: string;
  amount: number;
  cryptocurrency: string;
  network: string;
  walletAddress: string;
  dashboardUrl?: string;
}) {
  const subject = "Nueva solicitud de pago recibida";
  const message = `Se envió una nueva solicitud de pago.\n\nAfiliado: ${data.affiliateName} (${data.affiliateEmail})\nCódigo de afiliado: ${data.affiliateCode}\n\nMonto: $${data.amount.toFixed(2)}\nCriptomoneda: ${data.cryptocurrency.toUpperCase()}\nRed: ${data.network}\nDirección de wallet: ${data.walletAddress}\n\nPor favor, revisá y procesá esta solicitud de pago.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/admin/affiliates/payouts`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: "Admin",
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Revisar solicitud de pago",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateNewReferralEmailTemplate(data: {
  name: string;
  code: string;
  planName?: string | null;
  dashboardUrl?: string;
}) {
  const subject = "¡Nueva compra con tu código de afiliado!";
  let message = `¡Buenas noticias! Alguien acaba de hacer una compra usando tu código de afiliado: ${data.code}\n\n`;

  if (data.planName) {
    message += `Plan: ${data.planName}\n`;
  }

  message += `\nTu comisión se va a procesar una vez que se confirme el pago. Vas a recibir otro email cuando la comisión se sume a tu balance.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/affiliates`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver panel",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function affiliateCommissionCreatedEmailTemplate(data: {
  name: string;
  commission: number;
  totalAmount: number;
  planName?: string | null;
  dashboardUrl?: string;
}) {
  const subject = "Nueva comisión generada";
  let message = `¡Felicitaciones! Generaste una nueva comisión.\n\nComisión: $${data.commission.toFixed(2)}\nMonto de la compra: $${data.totalAmount.toFixed(2)}`;

  if (data.planName) {
    message += `\nPlan: ${data.planName}`;
  }

  message += `\n\nEsta comisión se sumó a tu balance y está disponible para retirar.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard/affiliates`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver panel",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}

export async function accountConnectionErrorEmailTemplate(data: {
  name: string;
  dashboardUrl?: string;
}) {
  const subject = "Error de conexión de cuenta";
  const message = `Detectamos un error al conectar una de tus cuentas.\n\nPor favor, entrá a tu panel para revisar y reconectar tu cuenta.`;

  const dashboardUrl =
    data.dashboardUrl ||
    `${getAppUrl()}/dashboard`;

  const template = await loadTemplate("base");
  const html = replaceTemplateVariables(template, {
    subject,
    name: data.name,
    message: message.replace(/\n/g, "<br>"),
    buttonUrl: dashboardUrl,
    buttonText: "Ver panel",
    year: new Date().getFullYear(),
  });

  return {
    html,
    text: stripHtml(html),
  };
}
