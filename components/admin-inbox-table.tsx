"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableLoading } from "@/components/ui/table-loading";
import { cn } from "@/lib/utils";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

interface InboundEmail {
  id: string;
  resendEmailId: string;
  mailFrom: string;
  rcptTo: string[];
  subject: string | null;
  status: string;
  readAt: string | null;
  archivedAt: string | null;
  receivedAt: string;
  createdAt: string;
  attachmentCount: number;
}

interface InboxStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

interface InboxResponse {
  emails: InboundEmail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: InboxStats;
}

type SortColumn = "from" | "subject" | "receivedAt" | null;
type FilterStatus = "all" | "unread" | "read" | "archived";

export function AdminInboxTable() {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingEmails, setUpdatingEmails] = useState<Set<string>>(new Set());
  const [deletingEmailId, setDeletingEmailId] = useState<string | null>(null);
  const loadInboxRef = useRef<((skipLoadingState?: boolean) => Promise<void>) | null>(null);

  const loadInbox = async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      if (filterStatus !== "all") {
        params.set("status", filterStatus);
      }

      const response = await fetch(`/api/admin/inbox?${params}`);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error loading inbox:", error);
    } finally {
      if (!skipLoadingState) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInbox(true);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("desc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleUpdateEmail = async (
    emailId: string,
    action: "markRead" | "markUnread" | "archive" | "unarchive"
  ) => {
    setUpdatingEmails((prev) => new Set(prev).add(emailId));

    try {
      const response = await fetch(`/api/admin/inbox/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await loadInbox(true);
      }
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setUpdatingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    setUpdatingEmails((prev) => new Set(prev).add(emailId));

    try {
      const response = await fetch(`/api/admin/inbox/${emailId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeletingEmailId(null);
        await loadInbox(true);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    } finally {
      setUpdatingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadInbox();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setCurrentPage(1);
      loadInbox();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    loadInboxRef.current = loadInbox;
  }, [currentPage, filterStatus, searchQuery]);

  useEffect(() => {
    if (isLoading || searchQuery) {
      return;
    }

    const interval = setInterval(() => {
      if (loadInboxRef.current) {
        setIsRefreshing(true);
        loadInboxRef.current(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isLoading, searchQuery]);

  const sortedEmails = useMemo(() => {
    if (!data?.emails) return [];

    let emails = [...data.emails];

    emails.sort((a, b) => {
      const aUnread = !a.readAt;
      const bUnread = !b.readAt;
      
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;

      if (sortColumn) {
        let compare = 0;

        switch (sortColumn) {
          case "from":
            compare = (a.mailFrom || "").localeCompare(b.mailFrom || "");
            break;
          case "subject":
            compare = (a.subject || "").localeCompare(b.subject || "");
            break;
          case "receivedAt":
            compare =
              new Date(a.receivedAt).getTime() -
              new Date(b.receivedAt).getTime();
            break;
        }

        return sortDirection === "desc" ? -compare : compare;
      }

      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });

    return emails;
  }, [data?.emails, sortColumn, sortDirection]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diffHours < 24 * 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "(No Subject)";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-3">


      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: "white" }}
      >
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <Button className="flex items-center shadow-none gap-1 text-sm bg-white rounded-lg px-3 py-2 border border-gray-200 pointer-events-none cursor-default">
              <span className="text-gray-400">Unread:</span>
              <span className="text-gray-400 font-medium">
                {data?.stats.unread || 0}
              </span>
            </Button>
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by sender or subject..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className={cn(
                  "bg-white shadow-none border-gray-200",
                  searchQuery ? "pl-9 pr-9" : "pl-9"
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex gap-1 text-sm bg-white rounded-lg p-1 border border-gray-200">
                {(["all", "unread", "read", "archived"] as FilterStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize",
                        filterStatus === status
                          ? "bg-gray-100 text-gray-600"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-3 shadow-none cursor-pointer h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    (isRefreshing || isLoading) && "animate-spin"
                  )}
                />
              </Button>
              <Link href="/dashboard/admin/inbox/new">
                <Button className="flex items-center gap-2 text-sm h-9">
                  <Plus className="h-4 w-4" />
                  New Email
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-max w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none px-3"
                  onClick={() => handleSort("subject")}
                >
                  <div className="flex items-center gap-3">
                    Subject
                    {sortColumn === "subject" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none px-3"
                  onClick={() => handleSort("from")}
                >
                  <div className="flex items-center gap-3">
                    From
                    {sortColumn === "from" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell px-3">To</TableHead>
                <TableHead
                  className="whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none hidden md:table-cell px-3"
                  onClick={() => handleSort("receivedAt")}
                >
                  <div className="flex items-center gap-3">
                    Received
                    {sortColumn === "receivedAt" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap text-right hidden md:table-cell px-3">
                  
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <TableLoading />
                  </TableCell>
                </TableRow>
              ) : sortedEmails.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8 bg-white rounded-b-md"
                  >
                    {searchQuery
                      ? "No emails found matching your search"
                      : "No emails in inbox"}
                  </TableCell>
                </TableRow>
              ) : (
                sortedEmails.map((email, index) => {
                  const isUnread = !email.readAt;
                  const isUpdating = updatingEmails.has(email.id);

                  return (
                    <React.Fragment key={email.id}>
                      <TableRow
                        className={cn(
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        )}
                      >
                        <TableCell className="whitespace-nowrap px-3">
                          <Link
                            href={`/dashboard/admin/inbox/${email.id}`}
                            className={cn(
                              "hover:underline flex items-center gap-3 cursor-pointer",
                              isUnread ? "text-gray-800" : "text-gray-400"
                            )}
                          >
                            <span className="truncate max-w-[150px] md:max-w-none">
                              {truncateText(email.subject, 50)}
                            </span>
                            {email.attachmentCount > 0 && (
                              <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-3">
                          <Link
                            href={`/dashboard/admin/inbox/${email.id}`}
                            className={cn(
                              "hover:underline cursor-pointer",
                              isUnread ? "text-gray-800" : "text-gray-400"
                            )}
                          >
                            <span className="truncate max-w-[120px] md:max-w-none">
                              {truncateText(email.mailFrom, 30)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className={cn(
                          "whitespace-nowrap hidden md:table-cell px-3",
                          isUnread ? "text-gray-800" : "text-gray-400"
                        )}>
                          {truncateText(
                            Array.isArray(email.rcptTo)
                              ? email.rcptTo[0]
                              : email.rcptTo,
                            25
                          )}
                        </TableCell>
                        <TableCell className={cn(
                          "whitespace-nowrap hidden md:table-cell px-3",
                          isUnread ? "text-gray-800" : "text-gray-400"
                        )}>
                          {formatDate(email.receivedAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right hidden md:table-cell px-3">
                          <div className="flex items-center justify-end gap-3">
                            {isUnread ? (
                              <button
                                onClick={() =>
                                  handleUpdateEmail(email.id, "markRead")
                                }
                                disabled={isUpdating}
                                className="cursor-pointer text-gray-600 hover:text-gray-400 disabled:opacity-50"
                              >
                                <MailOpen className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUpdateEmail(email.id, "markUnread")
                                }
                                disabled={isUpdating}
                                className="cursor-pointer text-gray-600 hover:text-gray-400 disabled:opacity-50"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            {email.archivedAt ? (
                              <button
                                onClick={() =>
                                  handleUpdateEmail(email.id, "unarchive")
                                }
                                disabled={isUpdating}
                                className="cursor-pointer text-gray-600 hover:text-gray-400 disabled:opacity-50"
                              >
                                <ArchiveRestore className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUpdateEmail(email.id, "archive")
                                }
                                disabled={isUpdating}
                                className="cursor-pointer text-gray-600 hover:text-gray-400 disabled:opacity-50"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingEmailId(email.id)}
                              disabled={isUpdating}
                              className="cursor-pointer text-gray-600 hover:text-gray-400 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {deletingEmailId === email.id && (
                        <TableRow className={cn(
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        )}>
                          <TableCell colSpan={5} className="p-3">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="flex flex-col items-center justify-center py-8 text-center gap-1">
                                <p className="text-lg">
                                  Are you sure you want to delete this email?
                                </p>
                                <p className="text-sm text-gray-400">
                                  This will permanently remove the email from{" "}
                                  <span className="font-semibold">
                                    {email.mailFrom}
                                  </span>
                                  {email.subject && (
                                    <>
                                      {" "}
                                      with subject{" "}
                                      <span className="font-semibold">
                                        "{email.subject}"
                                      </span>
                                    </>
                                  )}
                                  . This action cannot be undone.
                                  {email.attachmentCount > 0 && (
                                    <>
                                      {" "}
                                      This email has{" "}
                                      <span className="font-semibold">
                                        {email.attachmentCount} attachment
                                        {email.attachmentCount > 1 ? "s" : ""}
                                      </span>{" "}
                                      that will also be deleted.
                                    </>
                                  )}
                                </p>
                                <div className="mt-3 flex gap-3 w-full max-w-sm">
                                  <div
                                    className="flex items-center justify-center rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm font-medium h-9 cursor-pointer hover:text-gray-400 w-full"
                                    onClick={() => setDeletingEmailId(null)}
                                  >
                                    Cancel
                                  </div>
                                  <div
                                    className="flex items-center justify-center rounded-lg bg-black px-3 py-2 text-sm font-medium h-9 cursor-pointer hover:bg-gray-600 text-white w-full"
                                    onClick={() => handleDeleteEmail(email.id)}
                                  >
                                    {isUpdating ? "Deleting..." : "Delete"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages} (
              {data.pagination.total} emails)
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="shadow-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(data.pagination.totalPages, p + 1)
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
                className="shadow-none"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

