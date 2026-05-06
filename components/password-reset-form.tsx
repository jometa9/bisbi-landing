"use client";

import { useState } from "react";

import { updatePassword } from "@/app/(login)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

type ActionState = {
  error?: string;
  success?: string;
};

export function PasswordResetForm() {
  const [passwordState, setPasswordState] = useState<ActionState>({});
  const [isPasswordPending, setIsPasswordPending] = useState(false);

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsPasswordPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await updatePassword(formData);
      setPasswordState(result || {});

      if (result.success) {
        (event.target as HTMLFormElement).reset();
      }
    } catch (error) {
      setPasswordState({ error: "Error updating password" });
    } finally {
      setIsPasswordPending(false);
    }
  };

  return (
    <Card className="shadow-none border border-gray-200">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Change your password to protect access to your IPTRADE account.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <UILabel htmlFor="current-password">Current Password</UILabel>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={100}
            />
          </div>
          <div>
            <UILabel htmlFor="new-password">New Password</UILabel>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={100}
            />
          </div>
          <div>
            <UILabel htmlFor="confirm-password">Confirm New Password</UILabel>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={100}
            />
          </div>
          {passwordState.error && (
            <p className="text-red-500 text-sm">{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="text-green-500 text-sm">{passwordState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white"
            disabled={isPasswordPending}
          >
            {isPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

