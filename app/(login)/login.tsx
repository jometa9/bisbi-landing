"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const source = searchParams.get("source");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [redirectUrl, setRedirectUrl] = React.useState<string>("");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFromApp = source === "app";
  const isAppRedirect = redirect && redirect.startsWith("bisbi://");
  const appName = "Bisbi";

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;

    setIsGoogleLoading(true);
    try {
      await nextAuthSignIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleSuccessfulAuth = async () => {
    if (!session?.user) return;

    setIsRedirecting(true);

    if (isAppRedirect) {
      try {
        const response = await fetch("/api/web-login", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.user) {
            const fullRedirectUrl = new URL(redirect!);
            fullRedirectUrl.searchParams.set("apiKey", data.user.apiKey || "");

            setRedirectUrl(fullRedirectUrl.toString());
            return;
          }
        }
      } catch { }

      setRedirectUrl(redirect!);
      return;
    }

    router.replace("/dashboard");
  };

  React.useEffect(() => {
    if (status === "authenticated") {
      handleSuccessfulAuth();
    }
  }, [status, router, session]);

  React.useEffect(() => {
    if (status === "unauthenticated" && isGoogleLoading) {
      const timeout = setTimeout(() => {
        setIsGoogleLoading(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, isGoogleLoading]);

  React.useEffect(() => {
    if (!isRedirecting || !isAppRedirect) return;
    const urlToUse = redirectUrl || redirect;
    if (!urlToUse) return;
    if (!redirectUrl && redirect) return;
    try {
      window.location.href = urlToUse;
    } catch (error) {
      console.error("Error opening app:", error);
    }
  }, [isRedirecting, isAppRedirect, redirectUrl, redirect]);

  if (isRedirecting && isAppRedirect) {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Login Successful!
          </h2>
          <p className="text-xl text-gray-400">
            We&apos;ll take you back to {appName}
          </p>
        </div>
        <div className="flex text-sm items-center space-x-2 text-gray-600">
          Opening {appName}...
        </div>
        <Button
          onClick={() => {
            try {
              const urlToUse = redirectUrl || redirect!;
              window.location.href = urlToUse;
            } catch (error) {
              console.error("Error opening app:", error);
            }
          }}
          className="w-full justify-center rounded-xl py-3 text-md text-white"
          style={{ backgroundColor: "#7BA89C" }}
        >
          Open {appName}
        </Button>
        <p className="text-sm text-gray-600">
          Opening automatically, or click the button above
        </p>
      </div>
    );
  }

  if (!isMounted || status === "loading") {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {isFromApp ? `Access your ${appName} account` : "Welcome to Bisbi"}
        </h2>
        <p className="text-base" style={{ color: "#A8A8A2" }}>
          Sign in to download Bisbi
        </p>
      </div>

      <Button
        type="button"
        className="w-full justify-center gap-3 rounded-xl py-3 text-white text-md disabled:opacity-60"
        style={{ backgroundColor: "#1A1A18" }}
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path
                  fill="#4285F4"
                  d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                />
                <path
                  fill="#34A853"
                  d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                />
                <path
                  fill="#EA4335"
                  d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                />
              </g>
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {isFromApp && (
        <p
          onClick={() => window.history.back()}
          className="mx-auto block text-sm text-gray-600 transition hover:text-gray-800 cursor-pointer"
        >
          Back to application
        </p>
      )}
    </div>
  );
}
