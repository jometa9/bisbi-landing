"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_EMAIL_LANGS, type EmailLang } from "@/lib/email/translations";
import { useState } from "react";

const EMAIL_LANG_LABELS: Record<EmailLang, string> = {
  es: "Español",
  en: "English",
  zh: "中文",
  hi: "हिंदी",
  ar: "العربية",
};

export default function AdminSettings() {
  const { t } = useI18n();
  const [isAssigningSubscription, setIsAssigningSubscription] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const subscriptionProduct = "bisbi" as const;
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [subscriptionDuration, setSubscriptionDuration] = useState("1");
  const [emailLang, setEmailLang] = useState<EmailLang>("es");
  const [buttonStatus, setButtonStatus] = useState<"success" | "error" | null>(
    null
  );

  const availablePlans = [
    { value: "none", label: t.admin.assignSubscription.planFreeRemove },
    { value: "pro", label: t.admin.assignSubscription.planPro },
  ];

  const handleAssignFreeSubscription = async () => {
    try {
      setIsAssigningSubscription(true);
      setButtonStatus(null);

      if (!subscriptionEmail || !subscriptionDuration || !subscriptionProduct) {
        setButtonStatus("error");
        setTimeout(() => setButtonStatus(null), 2000);
        return;
      }

      if (!subscriptionPlan) {
        setButtonStatus("error");
        setTimeout(() => setButtonStatus(null), 2000);
        return;
      }

      const response = await fetch("/api/admin/assign-free-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: subscriptionEmail,
          productKey: subscriptionProduct,
          plan: subscriptionPlan,
          duration: parseInt(subscriptionDuration, 10),
          lang: emailLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign free subscription");
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);

      setSubscriptionEmail("");
      setSubscriptionPlan("");
      setSubscriptionDuration("1");
    } catch {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsAssigningSubscription(false);
    }
  };

  const buttonLabel = t.admin.assignSubscription.button.replace(
    "{product}",
    subscriptionProduct.toUpperCase()
  );

  return (
    <div className="space-y-3">
      <Input
        id="sub-email"
        placeholder={t.admin.assignSubscription.emailPlaceholder}
        value={subscriptionEmail}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSubscriptionEmail(e.target.value)
        }
        className="shadow-none bg-white"
      />
      <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
        <SelectTrigger>
          <SelectValue placeholder={t.admin.assignSubscription.selectPlan} />
        </SelectTrigger>
        <SelectContent>
          {availablePlans.map((plan) => (
            <SelectItem key={plan.value} value={plan.value}>
              {plan.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subscriptionDuration}
        onValueChange={setSubscriptionDuration}
      >
        <SelectTrigger>
          <SelectValue placeholder={t.admin.assignSubscription.selectDuration} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">{t.admin.assignSubscription.duration1m}</SelectItem>
          <SelectItem value="3">{t.admin.assignSubscription.duration3m}</SelectItem>
          <SelectItem value="6">{t.admin.assignSubscription.duration6m}</SelectItem>
          <SelectItem value="12">{t.admin.assignSubscription.duration1y}</SelectItem>
          <SelectItem value="24">{t.admin.assignSubscription.duration2y}</SelectItem>
          <SelectItem value="1200">{t.admin.assignSubscription.duration100y}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={emailLang} onValueChange={(v) => setEmailLang(v as EmailLang)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_EMAIL_LANGS.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {EMAIL_LANG_LABELS[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleAssignFreeSubscription}
        disabled={
          isAssigningSubscription ||
          !subscriptionEmail ||
          !subscriptionDuration ||
          !subscriptionProduct ||
          !subscriptionPlan
        }
        className="w-full"
      >
        {isAssigningSubscription
          ? t.admin.assignSubscription.buttonLoading
          : buttonStatus === "success"
            ? t.admin.assignSubscription.buttonSuccess
            : buttonStatus === "error"
              ? t.admin.assignSubscription.buttonError
              : buttonLabel}
      </Button>
    </div>
  );
}
