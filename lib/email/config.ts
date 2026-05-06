import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";
import { Resend } from "resend";

let cachedConfig: EmailConfig | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60 * 1000;

interface EmailConfig {
  apiKey: string | null;
  testEmail: string;
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
        testEmail: appSettings.resendTestEmail,
        emailFrom: appSettings.emailFrom,
      })
      .from(appSettings)
      .limit(1);

    const apiKey = settings?.apiKey || null;

    cachedConfig = {
      apiKey,
      testEmail: settings?.testEmail || "onboarding@resend.dev",
      emailFrom: settings?.emailFrom || "no-reply@iptradecopier.com",
    };
    cacheTime = now;

    return cachedConfig;
  } catch (error) {
    console.error("[EmailConfig] Error fetching config from DB:", error);
    return {
      apiKey: null,
      testEmail: "onboarding@resend.dev",
      emailFrom: "no-reply@iptradecopier.com",
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


const getSafeResendEmail = (email: string, testEmail: string): string => {
  const invalidTestDomains = [
    "@test.com",
    "@example.com",
    "@testing.com",
    "@sample.com",
  ];

  const isInvalidTestDomain = invalidTestDomains.some((domain) =>
    email.toLowerCase().endsWith(domain)
  );

  if (isInvalidTestDomain) {
    return testEmail;
  }
  return email;
};

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
    const safeRecipient = getSafeResendEmail(to, config.testEmail);

    try {
      const { data, error } = await resendInstance.emails.send({
        from: fromAddress,
        to: safeRecipient,
        subject,
        html,
        text,
      });

      if (error) {
        console.error(`[Email] Resend error:`, {
          error,
          originalRecipient: to,
          actualRecipient: safeRecipient,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      return {
        id: data?.id,
        provider: "resend",
        originalRecipient: to,
        actualRecipient: safeRecipient,
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
        testEmail: config.testEmail,
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
