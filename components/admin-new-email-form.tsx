"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Paperclip, Send, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PendingAttachment {
  file: File;
  id: string;
}

export function AdminNewEmailForm() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newEmailFromLocal, setNewEmailFromLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState<string>("");
  const [newEmailTo, setNewEmailTo] = useState("");
  const [sendToAllUsers, setSendToAllUsers] = useState(false);
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailContent, setNewEmailContent] = useState("");
  const [replyToEmailId, setReplyToEmailId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState<{
    subject: string;
    mailFrom: string;
    receivedAt: string;
    textBody: string | null;
    htmlBody: string | null;
  } | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailStatus, setSendEmailStatus] = useState<"success" | "error" | null>(null);
  const [lastSentCount, setLastSentCount] = useState<number>(1);
  const [lastFailedCount, setLastFailedCount] = useState<number>(0);

  useEffect(() => {
    const to = searchParams.get("to");
    const subject = searchParams.get("subject");
    const replyTo = searchParams.get("replyTo");
    if (to && typeof to === "string") setNewEmailTo(to);
    if (subject && typeof subject === "string") setNewEmailSubject(subject);
    if (replyTo && typeof replyTo === "string") setReplyToEmailId(replyTo);
  }, [searchParams]);

  useEffect(() => {
    if (!replyToEmailId) {
      setOriginalEmail(null);
      return;
    }
    fetch(`/api/admin/inbox/${replyToEmailId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.email) {
          setOriginalEmail({
            subject: data.email.subject || "(No Subject)",
            mailFrom: data.email.mailFrom || "",
            receivedAt: data.email.receivedAt || "",
            textBody: data.email.textBody ?? null,
            htmlBody: data.email.htmlBody ?? null,
          });
        } else {
          setOriginalEmail(null);
        }
      })
      .catch(() => setOriginalEmail(null));
  }, [replyToEmailId]);

  useEffect(() => {
    fetch("/api/admin/app-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.emailFrom) {
          const email = data.emailFrom;
          const atIndex = email.indexOf("@");
          if (atIndex > 0) {
            const domain = email.substring(atIndex);
            setEmailDomain(domain);
            const localPart = email.substring(0, atIndex);
            setNewEmailFromLocal(localPart);
          } else {
            setEmailDomain("@iptradecopier.com");
            setNewEmailFromLocal("");
          }
        } else {
          setEmailDomain("@iptradecopier.com");
        }
      })
      .catch((err) => console.error("Error fetching email config:", err));
  }, []);

  const fileToBase64 = (file: File): Promise<{ content: string; filename: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        if (base64) resolve({ content: base64, filename: file.name });
        else reject(new Error("Failed to read file"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    if (!fileArray.length) return;
    const newAttachments: PendingAttachment[] = fileArray.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) addFiles(files);
    e.target.value = "";
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) addFiles(files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendNewEmail = async () => {
    const fullEmailFrom = newEmailFromLocal + emailDomain;

    const isReply = !!replyToEmailId;
    if (isReply) {
      if (!newEmailTo || !newEmailSubject || !newEmailContent) {
        setSendEmailStatus("error");
        return;
      }
    } else if (!newEmailFromLocal || !newEmailSubject || !newEmailContent) {
      setSendEmailStatus("error");
      return;
    } else if (!sendToAllUsers && !newEmailTo.trim()) {
      setSendEmailStatus("error");
      return;
    }

    setIsSendingEmail(true);
    setSendEmailStatus(null);

    try {
      const attachmentsPayload =
        attachments.length > 0
          ? await Promise.all(attachments.map((a) => fileToBase64(a.file)))
          : undefined;
      const url = isReply
        ? `/api/admin/inbox/${replyToEmailId}/reply`
        : "/api/admin/inbox/send";

      const body = isReply
        ? {
          subject: newEmailSubject,
          message: newEmailContent,
          html: `<p>${newEmailContent.replace(/\n/g, "<br>")}</p>`,
          ...(attachmentsPayload && attachmentsPayload.length > 0 && { attachments: attachmentsPayload }),
        }
        : {
          from: fullEmailFrom,
          ...(sendToAllUsers ? { sendToAllUsers: true } : { to: newEmailTo }),
          subject: newEmailSubject,
          content: newEmailContent,
          ...(attachmentsPayload && attachmentsPayload.length > 0 && { attachments: attachmentsPayload }),
        };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = response.ok ? await response.json().catch(() => ({})) : null;
      if (response.ok) {
        setSendEmailStatus("success");
        setLastSentCount(typeof data?.sent === "number" ? data.sent : 1);
        setLastFailedCount(typeof data?.failed === "number" ? data.failed : 0);
        setNewEmailTo("");
        setSendToAllUsers(false);
        setNewEmailSubject("");
        setNewEmailContent("");
        setAttachments([]);
        if (replyToEmailId) setReplyToEmailId(null);
        setTimeout(() => setSendEmailStatus(null), 3000);
      } else {
        setSendEmailStatus("error");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSendEmailStatus("error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-gray-50 border overflow-hidden p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {!replyToEmailId && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 ">
              <Switch
                checked={sendToAllUsers}
                onCheckedChange={setSendToAllUsers}
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Send to all users
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {replyToEmailId && (
              <Link href={`/dashboard/admin/inbox/${replyToEmailId}`}>
                <Button variant="outline" size="sm" className="shadow-none">
                  <Mail className="h-4 w-4 mr-2" />
                  Back to Email
                </Button>
              </Link>
            )}
            <Link href="/dashboard/admin/inbox">
              <Button variant="outline" className="shadow-none">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to inbox
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {!replyToEmailId && (
            <div className="flex items-center rounded-md border border-input bg-white overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1">
              <input
                type="text"
                placeholder="From (e.g. support)"
                value={newEmailFromLocal}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v.includes("@")) setNewEmailFromLocal(v);
                }}
                className="flex-1 min-w-0 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="shrink-0 px-3 py-2 text-sm text-muted-foreground border-l border-input bg-gray-50/80 select-none">
                {emailDomain}
              </span>
            </div>
          )}

          {!replyToEmailId && !sendToAllUsers && (
            <Input
              type="text"
              placeholder="recipient@example.com, other@example.com (multiple = one email per recipient)"
              value={newEmailTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEmailTo(e.target.value)
              }
              className="bg-white"
            />
          )}
          {replyToEmailId && (
            <Input
              type="text"
              placeholder="recipient@example.com"
              value={newEmailTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEmailTo(e.target.value)
              }
              className="bg-white"
            />
          )}
        </div>

        <Input type="text"
          placeholder="Email subject"
          value={newEmailSubject}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewEmailSubject(e.target.value)
          }
          className="bg-white"
        />

        {replyToEmailId && originalEmail && (
          <div className="rounded-lg bg-white border overflow-hidden">
            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Original message</span>
                {" · "}
                <span>{originalEmail.mailFrom}</span>
                {" · "}
                <span>
                  {new Date(originalEmail.receivedAt).toLocaleString()}
                </span>
              </div>
              <Link href={`/dashboard/admin/inbox/${replyToEmailId}`}>
                <Button variant="ghost" size="sm" className="shadow-none text-gray-600 hover:text-gray-800">
                  View full email
                </Button>
              </Link>
            </div>
            <div className="p-3 max-h-40 overflow-y-auto text-sm text-gray-700">
              {originalEmail.textBody ? (
                <pre className="whitespace-pre-wrap font-sans">
                  {originalEmail.textBody}
                </pre>
              ) : originalEmail.htmlBody ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: originalEmail.htmlBody
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, ""),
                  }}
                />
              ) : (
                <p className="text-gray-400 italic">No content</p>
              )}
            </div>
          </div>
        )}

        <Textarea
          placeholder="Type your message here..."
          value={newEmailContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNewEmailContent(e.target.value)
          }
          rows={15}
          className="resize-none bg-white"
        />

        <div
          className={`rounded-lg border-2 border-dashed p-4 transition-colors ${isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAttachFiles}
          />
          <div className="flex flex-col p-4 items-center gap-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shadow-none"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach files
            </Button>
            <span className="text-xs text-gray-500">
              or drag and drop files here
            </span>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-gray-600 truncate max-w-[180px]">
                    {a.file.name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({(a.file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {sendEmailStatus === "success" && (
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-sm text-gray-600">
              {lastSentCount === 1 && lastFailedCount === 0 && "Email sent successfully"}
              {lastSentCount > 1 && lastFailedCount === 0 && `${lastSentCount} emails sent successfully (one per recipient)`}
              {lastFailedCount > 0 && `${lastSentCount} sent, ${lastFailedCount} failed`}
            </p>
          </div>
        )}

        {sendEmailStatus === "error" && (
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-sm text-gray-600">
              Failed to send email. Please check all fields are filled correctly.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end ">
          <Link href="/dashboard/admin/inbox">
            <Button variant="outline" disabled={isSendingEmail}>
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSendNewEmail}
            disabled={
              isSendingEmail ||
              (replyToEmailId
                ? !newEmailTo || !newEmailSubject || !newEmailContent
                : !newEmailFromLocal || !newEmailSubject || !newEmailContent || (!sendToAllUsers && !newEmailTo.trim()))
            }
            className="flex items-center gap-2"
          >
            {isSendingEmail ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

