import { db } from "@/lib/db/drizzle";
import { appSettings } from "@/lib/db/schema";

interface InboxConfig {
  webhookSecret: string | null;
  discordWebhookUrl: string | null;
}

export async function getInboxConfig(): Promise<InboxConfig> {
  try {
    const [settings] = await db
      .select({
        webhookSecret: appSettings.resendInboundWebhookSecret,
        discordWebhookUrl: appSettings.discordWebhookUrl,
      })
      .from(appSettings)
      .limit(1);

    return {
      webhookSecret: settings?.webhookSecret || null,
      discordWebhookUrl: settings?.discordWebhookUrl || null,
    };
  } catch (error) {
    console.error("[InboxConfig] Error fetching config:", error);
    return {
      webhookSecret: null,
      discordWebhookUrl: null,
    };
  }
}

export async function getInboxWebhookSecret(): Promise<string | null> {
  const config = await getInboxConfig();
  return config.webhookSecret;
}

