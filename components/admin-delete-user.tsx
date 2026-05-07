"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export default function AdminDeleteUser() {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [buttonStatus, setButtonStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      setButtonStatus(null);

      if (!email) {
        setButtonStatus("error");
        setTimeout(() => setButtonStatus(null), 2000);
        return;
      }

      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);
      setEmail("");
    } catch {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        id="delete-email"
        placeholder={t.admin.deleteUser.placeholder}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        className="shadow-none bg-white"
        disabled={isDeleting}
      />

      <Button
        onClick={handleDeleteUser}
        disabled={isDeleting || !email}
        className="w-full"
      >
        {isDeleting
          ? t.admin.deleteUser.buttonLoading
          : buttonStatus === "success"
            ? t.admin.deleteUser.buttonSuccess
            : buttonStatus === "error"
              ? t.admin.deleteUser.buttonError
              : t.admin.deleteUser.button}
      </Button>
    </div>
  );
}
