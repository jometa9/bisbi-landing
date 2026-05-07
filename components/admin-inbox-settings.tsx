"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

interface EmailSettings {
  resendApiKey: string;
  emailFrom: string;
  resendInboundWebhookSecret: string;
  discordWebhookUrl: string;
  discordDailyReportWebhookUrl: string;
}

export default function AdminInboxSettings() {
  const { t } = useI18n();
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
          text: data.error || t.admin.inboxSettings.reportError,
        });
        return;
      }

      if (data.skipped) {
        const reason = data.reason || "";
        let text = reason;
        if (reason.includes("discordDailyReportWebhookUrl not configured")) {
          text = t.admin.inboxSettings.reportNotConfigured;
        } else if (
          reason.includes("Another instance") ||
          reason.includes("running")
        ) {
          text = t.admin.inboxSettings.reportRunning;
        }
        setDailyReportFeedback({ type: "info", text });
        return;
      }

      setDailyReportFeedback({
        type: "success",
        text: t.admin.inboxSettings.reportSuccess,
      });
    } catch {
      setDailyReportFeedback({
        type: "error",
        text: t.admin.inboxSettings.reportNetworkError,
      });
    } finally {
      setIsRunningDailyReport(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="resend-api-key">{t.admin.inboxSettings.resendApiKey}</Label>
        <div className="flex gap-3">
          <Input
            id="resend-api-key"
            type={showApiKey ? "text" : "password"}
            placeholder="re_..."
            value={settings.resendApiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            {showApiKey ? t.admin.inboxSettings.hide : t.admin.inboxSettings.show}
          </Button>
        </div>
        <p className="text-xs text-gray-600">{t.admin.inboxSettings.resendApiKeyHint}</p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email-from">{t.admin.inboxSettings.emailFrom}</Label>
        <Input
          id="email-from"
          type="email"
          placeholder="noreply@bisbi.io"
          value={settings.emailFrom}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSettings((prev) => ({
              ...prev,
              emailFrom: e.target.value,
            }))
          }
          className="bg-white shadow-none"
        />
        <p className="text-xs text-gray-600">{t.admin.inboxSettings.emailFromHint}</p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="webhook-secret">{t.admin.inboxSettings.webhookSecret}</Label>
        <div className="flex gap-3">
          <Input
            id="webhook-secret"
            type={showWebhookSecret ? "text" : "password"}
            placeholder="whsec_..."
            value={settings.resendInboundWebhookSecret}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            {showWebhookSecret ? t.admin.inboxSettings.hide : t.admin.inboxSettings.show}
          </Button>
        </div>
        <p className="text-xs text-gray-600">{t.admin.inboxSettings.webhookSecretHint}</p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="discord-webhook">{t.admin.inboxSettings.discord}</Label>
        <Input
          id="discord-webhook"
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
          value={settings.discordWebhookUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSettings((prev) => ({
              ...prev,
              discordWebhookUrl: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
        <p className="text-xs text-gray-600">{t.admin.inboxSettings.discordHint}</p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="discord-daily-report-webhook">
          {t.admin.inboxSettings.discordDailyReport}
        </Label>
        <div className="flex gap-2 w-full items-center">
          <Input
            id="discord-daily-report-webhook"
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            value={settings.discordDailyReportWebhookUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            {isRunningDailyReport
              ? t.admin.inboxSettings.runLoading
              : t.admin.inboxSettings.run}
          </Button>
        </div>
        <p className="text-xs text-gray-600">{t.admin.inboxSettings.discordDailyReportHint}</p>
        {dailyReportFeedback && (
          <p className="text-xs text-gray-600">{dailyReportFeedback.text}</p>
        )}
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving
          ? t.admin.inboxSettings.saveLoading
          : saveStatus === "success"
            ? t.admin.inboxSettings.saveSuccess
            : saveStatus === "error"
              ? t.admin.inboxSettings.saveError
              : t.admin.inboxSettings.save}
      </Button>
    </div>
  );
}
