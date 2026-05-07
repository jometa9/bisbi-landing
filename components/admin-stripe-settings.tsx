"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface StripeSettings {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  bisbiProMonthlyPriceId: string;
  bisbiProAnnualPriceId: string;
  bisbiProMonthlyAmount: number;
  bisbiProAnnualAmount: number;
}

const DEFAULT_MONTHLY_AMOUNT = 1000;
const DEFAULT_ANNUAL_AMOUNT = 9600;

export default function AdminStripeSettings() {
  const [settings, setSettings] = useState<StripeSettings>({
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    bisbiProMonthlyPriceId: "",
    bisbiProAnnualPriceId: "",
    bisbiProMonthlyAmount: DEFAULT_MONTHLY_AMOUNT,
    bisbiProAnnualAmount: DEFAULT_ANNUAL_AMOUNT,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/app-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          stripeSecretKey: data.stripeSecretKey || "",
          stripeWebhookSecret: data.stripeWebhookSecret || "",
          bisbiProMonthlyPriceId: data.bisbiProMonthlyPriceId || "",
          bisbiProAnnualPriceId: data.bisbiProAnnualPriceId || "",
          bisbiProMonthlyAmount:
            typeof data.bisbiProMonthlyAmount === "number"
              ? data.bisbiProMonthlyAmount
              : DEFAULT_MONTHLY_AMOUNT,
          bisbiProAnnualAmount:
            typeof data.bisbiProAnnualAmount === "number"
              ? data.bisbiProAnnualAmount
              : DEFAULT_ANNUAL_AMOUNT,
        });
      }
    } catch (error) {
      console.error("Error loading Stripe settings:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving Stripe settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
        <div className="flex gap-3">
          <Input
            id="stripe-secret-key"
            type={showSecretKey ? "text" : "password"}
            placeholder="sk_live_... or sk_test_..."
            value={settings.stripeSecretKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSettings((prev) => ({ ...prev, stripeSecretKey: e.target.value }))
            }
            className="bg-white shadow-none font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSecretKey(!showSecretKey)}
            className="shadow-none whitespace-nowrap"
          >
            {showSecretKey ? "Hide" : "Show"}
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          Stripe API secret key. Required for checkout and webhooks.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="stripe-webhook-secret">Stripe Webhook Secret</Label>
        <div className="flex gap-3">
          <Input
            id="stripe-webhook-secret"
            type={showWebhookSecret ? "text" : "password"}
            placeholder="whsec_..."
            value={settings.stripeWebhookSecret}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSettings((prev) => ({
                ...prev,
                stripeWebhookSecret: e.target.value,
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
          Signing secret of the Stripe webhook endpoint pointing to /api/stripe/webhook.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="bisbi-pro-monthly-price">Bisbi Pro — Monthly Price ID</Label>
        <Input
          id="bisbi-pro-monthly-price"
          type="text"
          placeholder="price_..."
          value={settings.bisbiProMonthlyPriceId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSettings((prev) => ({
              ...prev,
              bisbiProMonthlyPriceId: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="bisbi-pro-annual-price">Bisbi Pro — Annual Price ID</Label>
        <Input
          id="bisbi-pro-annual-price"
          type="text"
          placeholder="price_..."
          value={settings.bisbiProAnnualPriceId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSettings((prev) => ({
              ...prev,
              bisbiProAnnualPriceId: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="bisbi-pro-monthly-amount">Monthly Amount (cents)</Label>
          <Input
            id="bisbi-pro-monthly-amount"
            type="number"
            min={0}
            value={settings.bisbiProMonthlyAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = parseInt(e.target.value, 10);
              setSettings((prev) => ({
                ...prev,
                bisbiProMonthlyAmount: isNaN(v) ? 0 : v,
              }));
            }}
            className="bg-white shadow-none"
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="bisbi-pro-annual-amount">Annual Amount (cents)</Label>
          <Input
            id="bisbi-pro-annual-amount"
            type="number"
            min={0}
            value={settings.bisbiProAnnualAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = parseInt(e.target.value, 10);
              setSettings((prev) => ({
                ...prev,
                bisbiProAnnualAmount: isNaN(v) ? 0 : v,
              }));
            }}
            className="bg-white shadow-none"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving
          ? "Saving..."
          : saveStatus === "success"
            ? "Saved!"
            : saveStatus === "error"
              ? "Error"
              : "Save Stripe Settings"}
      </Button>
    </div>
  );
}
