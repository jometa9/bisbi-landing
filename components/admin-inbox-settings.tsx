"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface EmailSettings {
  resendApiKey: string;
  emailFrom: string;
  resendInboundWebhookSecret: string;
  discordWebhookUrl: string;
  discordDailyReportWebhookUrl: string;
}

export default function AdminInboxSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    resendApiKey: "",
    emailFrom: "",
    resendInboundWebhookSecret: "",
    discordWebhookUrl: "",
    discordDailyReportWebhookUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isRunningDailyReport, setIsRunningDailyReport] = useState(false);
  const [dailyReportFeedback, setDailyReportFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/app-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          resendApiKey: data.resendApiKey || "",
          emailFrom: data.emailFrom || "",
          resendInboundWebhookSecret: data.resendInboundWebhookSecret || "",
          discordWebhookUrl: data.discordWebhookUrl || "",
          discordDailyReportWebhookUrl: data.discordDailyReportWebhookUrl || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resendApiKey: settings.resendApiKey,
          emailFrom: settings.emailFrom,
          resendInboundWebhookSecret: settings.resendInboundWebhookSecret,
          discordWebhookUrl: settings.discordWebhookUrl,
          discordDailyReportWebhookUrl: settings.discordDailyReportWebhookUrl,
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunDailyReport = async () => {
    setDailyReportFeedback(null);
    setIsRunningDailyReport(true);
    try {
      const response = await fetch("/api/admin/run-daily-report", {
        method: "POST",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        skipped?: boolean;
        reason?: string;
        error?: string;
      };

      if (!response.ok) {
        setDailyReportFeedback({
          type: "error",
          text: data.error || "Could not send the report.",
        });
        return;
      }

      if (data.skipped) {
        const reason = data.reason || "";
        let text = reason;
        if (reason.includes("discordDailyReportWebhookUrl not configured")) {
          text =
            "Set the report webhook above and save before running.";
        } else if (
          reason.includes("Another instance") ||
          reason.includes("running")
        ) {
          text =
            "Another process is running the report; try again in a few seconds.";
        }
        setDailyReportFeedback({ type: "info", text });
        return;
      }

      setDailyReportFeedback({
        type: "success",
        text: "Report sent to Discord.",
      });
    } catch {
      setDailyReportFeedback({
        type: "error",
        text: "Network error while running the report.",
      });
    } finally {
      setIsRunningDailyReport(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="resend-api-key">Resend API Key</Label>
        <div className="flex gap-3">
          <Input
            id="resend-api-key"
            type={showApiKey ? "text" : "password"}
            placeholder="re_..."
            value={settings.resendApiKey}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                resendApiKey: e.target.value,
              }))
            }
            className="bg-white shadow-none font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowApiKey(!showApiKey)}
            className="shadow-none whitespace-nowrap"
          >
            {showApiKey ? "Hide" : "Show"}
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          Your Resend API key from the Resend dashboard. Required for sending emails.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email-from">Default From Address</Label>
        <Input
          id="email-from"
          type="email"
          placeholder="noreply@bisbi.io"
          value={settings.emailFrom}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              emailFrom: e.target.value,
            }))
          }
          className="bg-white shadow-none"
        />
        <p className="text-xs text-gray-600">
          The default &quot;from&quot; email address for outgoing emails.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="webhook-secret">Inbound Webhook Secret</Label>
        <div className="flex gap-3">
          <Input
            id="webhook-secret"
            type={showWebhookSecret ? "text" : "password"}
            placeholder="whsec_..."
            value={settings.resendInboundWebhookSecret}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                resendInboundWebhookSecret: e.target.value,
              }))
            }
            className="bg-white shadow-none font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
            className="shadow-none whitespace-nowrap"
          >
            {showWebhookSecret ? "Hide" : "Show"}
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          The Svix signing secret from Resend dashboard (Webhooks section). Required for receiving inbound emails.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
        <Input
          id="discord-webhook"
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
          value={settings.discordWebhookUrl}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              discordWebhookUrl: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
        <p className="text-xs text-gray-600">
          Optional: Discord webhook URL to receive notifications when new emails arrive. Get this from Discord Server Settings → Integrations → Webhooks.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="discord-daily-report-webhook">
          Discord daily report
        </Label>
        <div className="flex gap-2 w-full items-center">
          <Input
            id="discord-daily-report-webhook"
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            value={settings.discordDailyReportWebhookUrl}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                discordDailyReportWebhookUrl: e.target.value,
              }))
            }
            className="bg-white shadow-none font-mono text-sm flex-1 min-w-0"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleRunDailyReport}
            disabled={isRunningDailyReport}
            className="shrink-0 shadow-none whitespace-nowrap"
          >
            {isRunningDailyReport ? "…" : "Run"}
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          Separate from the inbox webhook above. The automatic report uses the
          same ~24h in-process scheduler as subscription checks (runs while the
          Node server is up).
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving
          ? "Saving..."
          : saveStatus === "success"
            ? "Saved!"
            : saveStatus === "error"
              ? "Error"
              : "Save Settings"}
      </Button>
    </div>
  );
}
