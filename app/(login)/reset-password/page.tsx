"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionState } from "@/lib/auth/middleware";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect, useState } from "react";
import { resetPasswordAction } from "../actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    {
      error: "",
      autoLogin: false,
    }
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDashboardRedirect = () => {
    setIsRedirecting(true);
    router.push("/dashboard");
  };

  useEffect(() => {
    if (state.success) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        const redirectTo =
          state.autoLogin || session ? "/dashboard" : "/sign-in";
        router.push(redirectTo);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.autoLogin, session, router]);

  useEffect(() => {
    if (state.error && !isPending) {
      setHasSubmitted(false);
    }
  }, [state.error, isPending]);


  if (session && !state.success) {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            You're Already Signed In
          </h2>
          <p className="text-xl text-gray-400">
            You can update your password here or use account settings.
          </p>
        </div>

        {token ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              You're signed in as <strong>{session.user?.email}</strong>
            </p>

            <form
              action={async (formData) => {
                setHasSubmitted(true);
                await formAction(formData);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="token" value={token} />
              <div className="space-y-1">
                <div>
                  <Label htmlFor="password" className="text-sm text-gray-700">
                    New Password
                  </Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={100}
                  disabled={
                    isPending ||
                    (hasSubmitted && !state.error) ||
                    !!state.success
                  }
                />
                <p className="text-xs text-gray-600">
                  Password must be at least 8 characters long.
                </p>
              </div>

              <div className="space-y-1">
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm text-gray-700"
                  >
                    Confirm Password
                  </Label>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={100}
                  disabled={
                    isPending ||
                    (hasSubmitted && !state.error) ||
                    !!state.success
                  }
                />
              </div>

              {state.error && (
                <div className="text-sm text-gray-600">
                  <p>{state.error}</p>
                </div>
              )}

              {state.success && (
                <div className="text-sm text-gray-600">
                  <p>{state.success}</p>
                  <p className="text-sm opacity-75 mt-1">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-sm opacity-75">
                    Redirecting to dashboard in 2 seconds...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
                disabled={
                  isPending || (hasSubmitted && !state.error) || !!state.success
                }
              >
                {state.success ? (
                  "Password Updated Successfully"
                ) : isPending || (hasSubmitted && !state.error) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            <div className="text-sm text-gray-600">
              <Link
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  handleDashboardRedirect();
                }}
                className={`font-semibold text-gray-900 hover:underline ${
                  isRedirecting ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Redirecting to Dashboard...
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm">
              <p>You don't have a valid reset token. Please return to your dashboard.</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full block"
                onClick={(e) => {
                  e.preventDefault();
                  handleDashboardRedirect();
                }}
              >
                <Button
                  className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to Dashboard...
                    </>
                  ) : (
                    "Go to Dashboard"
                  )}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Invalid Reset Link
          </h2>
          <p className="text-xl text-gray-400">
            The password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please request a new password reset link.
          </p>
          <Link href="/forgot-password" className="w-full block">
            <Button className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isMounted || status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20" id="reset-form">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {session ? "Update Your Password" : "Reset Your Password"}
        </h2>
        <p className="text-xl text-gray-400">
          {session
            ? "Set a new password for your account"
            : "Create a new password for your IPTRADE account"}
        </p>

        {session && (
          <div className="mt-2 text-sm text-gray-600">
            You're already signed in as <strong>{session.user?.email}</strong>
          </div>
        )}
      </div>

      <form
        action={async (formData) => {
          setHasSubmitted(true);
          await formAction(formData);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="token" value={token} />
        <div className="space-y-1">
          <div>
            <Label htmlFor="password" className="text-sm text-gray-700">
              New Password
            </Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            maxLength={100}
            disabled={
              isPending || (hasSubmitted && !state.error) || !!state.success
            }
          />
          <p className="text-xs text-gray-600">
            Password must be at least 8 characters long.
          </p>
        </div>

        <div className="space-y-1">
          <div>
            <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirm Password
            </Label>
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            maxLength={100}
            disabled={
              isPending || (hasSubmitted && !state.error) || !!state.success
            }
          />
        </div>

        {state.error && (
          <div className="text-sm text-gray-600">
            <p>{state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="text-sm text-gray-600">
            <p>{state.success}</p>
            {session && (
              <p className="text-sm opacity-75 mt-1">
                Your password has been updated successfully.
              </p>
            )}
            <p className="text-sm opacity-75">
              {state.autoLogin || session
                ? "Redirecting to dashboard in 2 seconds..."
                : "Redirecting to sign in page in 2 seconds..."}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
          disabled={
            isPending || (hasSubmitted && !state.error) || !!state.success
          }
        >
          {state.success ? (
            "Password Updated Successfully"
          ) : isPending || (hasSubmitted && !state.error) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {session ? "Updating Password..." : "Resetting Password..."}
            </>
          ) : session ? (
            "Update Password"
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="text-sm text-gray-600">
        {state.success ? (
          <Link
            href={state.autoLogin || session ? "/dashboard" : "/sign-in"}
            className="font-semibold text-gray-900 hover:underline"
          >
            {state.autoLogin || session ? "Go to Dashboard" : "Go to Sign In"}
          </Link>
        ) : (
          <Link
            href={session ? "/dashboard" : "/sign-in"}
            className={`font-semibold text-gray-900 hover:underline ${
              isPending || (hasSubmitted && !state.error)
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            {session ? "Back to Dashboard" : "Back to Sign In"}
          </Link>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 text-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
