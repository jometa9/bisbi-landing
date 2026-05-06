"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminEmailBroadcast() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailType, setEmailType] = useState<"mass" | "individual">("mass");
  const [isSending, setIsSending] = useState(false);
  const [testButtonStatus, setTestButtonStatus] = useState<
    "success" | "error" | null
  >(null);
  const [sendButtonStatus, setSendButtonStatus] = useState<
    "success" | "error" | null
  >(null);

  const handleSendEmail = async (testMode: boolean = false) => {
    if (!subject.trim() || !message.trim()) {
      if (testMode) {
        setTestButtonStatus("error");
        setTimeout(() => setTestButtonStatus(null), 2000);
      } else {
        setSendButtonStatus("error");
        setTimeout(() => setSendButtonStatus(null), 2000);
      }
      return;
    }

    if (emailType === "individual" && !recipientEmail.trim()) {
      if (testMode) {
        setTestButtonStatus("error");
        setTimeout(() => setTestButtonStatus(null), 2000);
      } else {
        setSendButtonStatus("error");
        setTimeout(() => setSendButtonStatus(null), 2000);
      }
      return;
    }

    if (emailType === "individual" && recipientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail.trim())) {
        if (testMode) {
          setTestButtonStatus("error");
          setTimeout(() => setTestButtonStatus(null), 2000);
        } else {
          setSendButtonStatus("error");
          setTimeout(() => setSendButtonStatus(null), 2000);
        }
        return;
      }
    }

    setIsSending(true);
    if (testMode) {
      setTestButtonStatus(null);
    } else {
      setSendButtonStatus(null);
    }

    try {
      let response;

      if (emailType === "individual") {
        response = await fetch("/api/admin/individual-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            message,
            recipientEmail: recipientEmail.trim(),
          }),
        });
      } else {
        response = await fetch("/api/admin/mass-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            message,
            testMode,
          }),
        });
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (testMode) {
        setTestButtonStatus("success");
        setTimeout(() => setTestButtonStatus(null), 2000);
      } else {
        setSendButtonStatus("success");
        setTimeout(() => setSendButtonStatus(null), 2000);
      }

      if (emailType === "individual" || !testMode) {
        setSubject("");
        setMessage("");
        setRecipientEmail("");
      }
    } catch {
      if (testMode) {
        setTestButtonStatus("error");
        setTimeout(() => setTestButtonStatus(null), 2000);
      } else {
        setSendButtonStatus("error");
        setTimeout(() => setSendButtonStatus(null), 2000);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="">
        <div className="flex gap-3 text-sm px-3 py-2 rounded-lg bg-white border border-gray-200">
          <label
            className={`cursor-pointer hover:text-gray-600
              ${emailType === "mass" ? "text-gray-700" : "text-gray-300"}
            `}
          >
            <input
              type="radio"
              name="emailType"
              value="mass"
              checked={emailType === "mass"}
              onChange={(e) =>
                setEmailType(e.target.value as "mass" | "individual")
              }
              className="sr-only "
            />
            Mass Email
          </label>

          <label
            className={`cursor-pointer hover:text-gray-600
              ${emailType === "individual" ? "text-gray-700" : "text-gray-300"}
            `}
          >
            <input
              type="radio"
              name="emailType"
              value="individual"
              checked={emailType === "individual"}
              onChange={(e) =>
                setEmailType(e.target.value as "mass" | "individual")
              }
              className="sr-only bg-white"
            />
            Individual Email
          </label>
        </div>
      </div>

      {emailType === "individual" && (
        <Input
          placeholder="Recipient Email Address"
          value={recipientEmail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRecipientEmail(e.target.value)
          }
          className="shadow-none bg-white"
          type="email"
        />
      )}

      <Input
        placeholder="Email Subject"
        value={subject}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSubject(e.target.value)
        }
        className="shadow-none bg-white"
      />
      <Textarea
        placeholder="Email Message"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMessage(e.target.value)
        }
        rows={7}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => handleSendEmail(true)}
          variant="outline"
          disabled={isSending}
          className="w-full shadow-none"
        >
          {isSending
            ? "Sending..."
            : testButtonStatus === "success"
              ? "Success"
              : testButtonStatus === "error"
                ? "Error"
                : emailType === "individual"
                  ? "Send Test Individual Email"
                  : "Send Test Email"}
        </Button>
        <Button
          onClick={() => handleSendEmail(false)}
          disabled={isSending}
          className="w-full"
        >
          {isSending
            ? "Sending..."
            : sendButtonStatus === "success"
              ? "Success"
              : sendButtonStatus === "error"
                ? "Error"
                : emailType === "individual"
                  ? "Send Individual Email"
                  : "Send to All Users"}
        </Button>
      </div>
    </div>
  );
}
