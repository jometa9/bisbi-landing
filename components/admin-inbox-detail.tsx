"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CornerDownLeft,
  Download,
  Eye,
  EyeOff,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string | null;
  sizeBytes: number | null;
  hasContent: boolean;
}

interface EmailDetail {
  id: string;
  resendEmailId: string;
  mailFrom: string;
  rcptTo: string[];
  subject: string | null;
  messageId: string | null;
  textBody: string | null;
  htmlBody: string | null;
  headers: Record<string, string> | null;
  status: string;
  readAt: string | null;
  archivedAt: string | null;
  receivedAt: string;
  createdAt: string;
}

interface Props {
  emailId: string;
}

function sanitizeHtml(html: string): string {
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "");
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  sanitized = sanitized.replace(/<(iframe|object|embed|form)[^>]*>.*?<\/\1>/gi, "");
  sanitized = sanitized.replace(/<(iframe|object|embed|form)[^>]*\/?>/gi, "");
  
  return sanitized;
}

export function AdminInboxDetail({ emailId }: Props) {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"html" | "text">("html");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewedImages, setPreviewedImages] = useState<Map<string, string>>(new Map());
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const loadEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/inbox/${emailId}`);

      if (!response.ok) {
        throw new Error("Failed to load email");
      }

      const data = await response.json();
      setEmail(data.email);
      setAttachments(data.attachments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (
    action: "markRead" | "markUnread" | "archive" | "unarchive"
  ) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/inbox/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await loadEmail();
      }
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEmail = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/inbox/${emailId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/dashboard/admin/inbox";
      } else {
        const data = await response.json();
        alert(`Failed to delete email: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      alert("Failed to delete email");
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const toggleImagePreview = async (attachment: EmailAttachment) => {
    const isImage = attachment.contentType?.startsWith("image/");
    
    if (!isImage || !attachment.hasContent) return;

    if (previewedImages.has(attachment.id)) {
      const url = previewedImages.get(attachment.id);
      if (url) {
        URL.revokeObjectURL(url);
      }
      const newMap = new Map(previewedImages);
      newMap.delete(attachment.id);
      setPreviewedImages(newMap);
    } else {
      try {
        const response = await fetch(`/api/admin/inbox/attachments/${attachment.id}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const newMap = new Map(previewedImages);
          newMap.set(attachment.id, url);
          setPreviewedImages(newMap);
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    loadEmail();
  }, [emailId]);

  useEffect(() => {
    return () => {
      previewedImages.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg flex items-center justify-center min-h-[25vh] text-center">
        <p className="text-gray-400">Loading email...</p>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="rounded-lg bg-gray-100 p-8 text-center">
        <p className="text-gray-600">{error || "Email not found"}</p>
      </div>
    );
  }

  const isUnread = !email.readAt;
  const isArchived = !!email.archivedAt;

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white border overflow-hidden">
        <div className="p-3 bg-gray-50 border-b space-y-3">
          <div className="flex items-center justify-end gap-2">
              <Link href="/dashboard/admin/inbox">
                <Button
                  variant="outline"
                  className="shadow-none"
                  title="Back to inbox"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to inbox
                </Button>
              </Link>
              {isConfirmingDelete ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={isDeleting}
                    size="sm"
                    className="shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteEmail}
                    disabled={isDeleting}
                    size="sm"
                    className="shadow-none"
                  >
                    {isDeleting ? "Deleting..." : "Confirm"}
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={`/dashboard/admin/inbox/new?to=${encodeURIComponent(email.mailFrom || "")}&subject=${encodeURIComponent(email.subject?.toLowerCase().startsWith("re:") ? email.subject : `Re: ${email.subject || "(No Subject)"}`)}&replyTo=${encodeURIComponent(email.id)}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none"
                      title="Reply"
                    >
                      <CornerDownLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isUnread ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateEmail("markRead")}
                      disabled={isUpdating}
                      size="sm"
                      className="shadow-none"
                    >
                      <MailOpen className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateEmail("markUnread")}
                      disabled={isUpdating}
                      size="sm"
                      className="shadow-none"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}

                  {isArchived ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateEmail("unarchive")}
                      disabled={isUpdating}
                      size="sm"
                      className="shadow-none"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateEmail("archive")}
                      disabled={isUpdating}
                      size="sm"
                      className="shadow-none"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmingDelete(true)}
                    disabled={isDeleting}
                    size="sm"
                    className="shadow-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Subject:</span>{" "}
              <span className="font-medium">{email.subject || "(No Subject)"}</span>
            </div>
            <div>
              <span className="text-gray-600">From:</span>{" "}
              <span className="font-medium">{email.mailFrom}</span>
            </div>
            <div>
              <span className="text-gray-600">To:</span>{" "}
              <span className="font-medium">
                {Array.isArray(email.rcptTo)
                  ? email.rcptTo.join(", ")
                  : email.rcptTo}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Received:</span>{" "}
              <span>{formatDate(email.receivedAt)}</span>
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className=" border-b bg-gray-50">

            <div className="flex flex-wrap gap-3 p-3">
              {attachments.map((attachment) => {
                const isImage = attachment.contentType?.startsWith("image/");
                const canPreview = isImage && attachment.hasContent;
                const isPreviewing = previewedImages.has(attachment.id);

                return (
                  <div key={attachment.id} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                    <span className="text-sm flex items-center gap-2 flex-1">
                      <span className="text-gray-600">{attachment.filename}</span>
                      <span className="text-gray-400">
                        ({formatFileSize(attachment.sizeBytes)})
                      </span>
                    </span>
                    <div className="flex items-center gap-3">
                      {canPreview && (
                        <button
                          onClick={() => toggleImagePreview(attachment)}
                          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          {isPreviewing ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {attachment.hasContent && (
                        <a
                          href={`/api/admin/inbox/attachments/${attachment.id}`}
                          download={attachment.filename}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {email.htmlBody && email.textBody && (
          <div className="p-3 border-b bg-gray-50">
            <div className="flex gap-1 text-sm">
              <Button
                onClick={() => setViewMode("html")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors shadow-none",
                  viewMode === "html"
                    ? "bg-white text-gray-600 border-gray-200 border hover:bg-white"
                    : "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-50"
                )}
              >
                HTML
              </Button>
                <Button
                onClick={() => setViewMode("text")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors shadow-none",
                  viewMode === "text"
                    ? "bg-white text-gray-600 border-gray-200 border hover:bg-white"
                    : "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-50"
                )}
              >
                Plain Text
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div>
            {viewMode === "html" && email.htmlBody ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(email.htmlBody),
                }}
              />
            ) : email.textBody ? (
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {email.textBody}
              </pre>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 italic">No content available</p>
              </div>
            )}
          </div>

          {previewedImages.size > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-600">Image Previews</h3>
              <div className="space-y-3">
                {attachments
                  .filter((att) => previewedImages.has(att.id))
                  .map((attachment) => {
                    const url = previewedImages.get(attachment.id);
                    return (
                      <div key={attachment.id} className="space-y-2">
                        <p className="text-sm text-gray-600">{attachment.filename}</p>
                        <div className="rounded-lg border bg-gray-50 p-3 flex items-center justify-center">
                          <img
                            src={url}
                            alt={attachment.filename}
                            className="max-w-full h-auto rounded"
                            style={{ maxHeight: "500px" }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

