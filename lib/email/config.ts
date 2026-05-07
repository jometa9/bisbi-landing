import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";
import { Resend } from "resend";

let cachedConfig: EmailConfig | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60 * 1000;

interface EmailConfig {
  apiKey: string | null;
  emailFrom: string;
}

export async function getEmailConfig(): Promise<EmailConfig> {
  const now = Date.now();

  if (cachedConfig && now - cacheTime < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const [settings] = await db
      .select({
        apiKey: appSettings.resendApiKey,
        emailFrom: appSettings.emailFrom,
      })
      .from(appSettings)
      .limit(1);

    const apiKey = settings?.apiKey || null;

    cachedConfig = {
      apiKey,
      emailFrom: settings?.emailFrom || "no-reply@bisbi.io",
    };
    cacheTime = now;

    return cachedConfig;
  } catch (error) {
    console.error("[EmailConfig] Error fetching config from DB:", error);
    return {
      apiKey: null,
      emailFrom: "no-reply@bisbi.io",
    };
  }
}

export function clearEmailConfigCache() {
  cachedConfig = null;
  cacheTime = 0;
  resendClient = null;
  resendApiKey = null;
}

let resendClient: Resend | null = null;
let resendApiKey: string | null = null;

export async function getResendClient(): Promise<Resend | null> {
  const config = await getEmailConfig();

  if (!config.apiKey || config.apiKey.trim() === "") {
    return null;
  }

  if (resendClient && resendApiKey === config.apiKey) {
    return resendClient;
  }

  resendClient = new Resend(config.apiKey);
  resendApiKey = config.apiKey;

  return resendClient;
}


export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}  ) {
  try {
    const config = await getEmailConfig();

    if (!config.apiKey || config.apiKey.trim() === "") {
      console.error("[Email] Resend API key is missing or empty in app settings");
      throw new Error("No email service configured. Please configure Resend API key in settings.");
    }

    const resendInstance = await getResendClient();

    if (!resendInstance) {
      console.error("[Email] Failed to create Resend client - API key may be invalid");
      throw new Error("No email service configured. Please configure Resend API key in settings.");
    }

    const fromAddress = from || config.emailFrom;

    try {
      const { data, error } = await resendInstance.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        console.error(`[Email] Resend error:`, {
          error,
          recipient: to,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      return {
        id: data?.id,
        provider: "resend",
        recipient: to,
      };
    } catch (resendError) {
      throw resendError;
    }
  } catch (error) {
    throw error;
  }
}

export async function testEmailConfiguration() {
  try {
    const config = await getEmailConfig();
    const resendInstance = await getResendClient();

    let resendConfigured = false;

    if (resendInstance) {
      try {
        await resendInstance.domains.list();
        resendConfigured = true;
      } catch (error) {
        console.error("Error checking Resend configuration:", error);
      }
    }

    return {
      success: true,
      message: "Email configuration test passed",
      services: {
        resend: resendConfigured ? "configured" : "not configured",
      },
      config: {
        hasApiKey: !!config.apiKey,
        emailFrom: config.emailFrom,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    };
  }
}
