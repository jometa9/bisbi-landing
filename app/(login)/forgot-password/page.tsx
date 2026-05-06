"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionState } from "@/lib/auth/middleware";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useActionState, useState } from "react";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    forgotPassword,
    {
      error: "",
      success: "",
    }
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (formData: FormData) => {
    if (hasSubmitted || isPending || showSuccess) {
      return;
    }

    setHasSubmitted(true);
    formAction(formData);
  };

  React.useEffect(() => {
    if (state.error && !isPending) {
      setHasSubmitted(false);
    }
  }, [state.error, isPending]);

  React.useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
    }
  }, [state.success]);

  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setHasSubmitted(false);
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="space-y-3 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Reset your password
        </h2>
        <p className="text-xl text-gray-400">
          We'll send you a link to reset your password
        </p>
      </div>

      <form action={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <div>
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email
            </Label>
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            maxLength={50}
            disabled={isPending || hasSubmitted || showSuccess}
          />
          <p className="text-xs text-gray-600">
            Enter the email address associated with your account
          </p>
        </div>

        {state.error && (
          <div className="text-sm text-gray-600">
            <p>{state.error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="text-sm text-gray-600">
            <p>{state.success}</p>
            {state.resetLink && (
              <div className="mt-2">
                <Link
                  href={state.resetLink}
                  className={`text-blue-500 underline ${
                    isPending || hasSubmitted || showSuccess
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  Reset Password Link (Development Only)
                </Link>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
          disabled={
            isPending || (hasSubmitted && !state.error) || showSuccess
          }
        >
          {showSuccess ? (
            "Reset Link Sent"
          ) : isPending || (hasSubmitted && !state.error) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="text-sm text-gray-600">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className={`font-semibold text-gray-900 hover:underline ${
            isPending || hasSubmitted || showSuccess
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
