"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/dashboard";
  }

  return nextPath;
}

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isActive = true;

    async function completeEmailVerificationLogin() {
      const nextPath = getSafeNextPath(searchParams.get("next"));
      const callbackError = searchParams.get("error_description") ?? searchParams.get("error");

      if (callbackError) {
        if (isActive) {
          setErrorMessage(decodeURIComponent(callbackError));
        }
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (isActive) {
            setErrorMessage(error.message);
          }
          return;
        }
      } else if (typeof window !== "undefined" && window.location.hash.length > 1) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            if (isActive) {
              setErrorMessage(error.message);
            }
            return;
          }
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(nextPath);
        return;
      }

      if (isActive) {
        setErrorMessage("Your email is verified, but we could not sign you in automatically. Please log in once to continue.");
      }
    }

    completeEmailVerificationLogin();

    return () => {
      isActive = false;
    };
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 backdrop-blur-md text-center">
        {errorMessage ? (
          <>
            <h1 className="text-3xl font-medium tracking-tight mb-3">Verification failed</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-8">{errorMessage}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full bg-white text-black py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-medium tracking-tight mb-3">Verifying your email</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-8">
              Please wait while we complete your sign in and redirect you.
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-700 dark:text-neutral-200" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
