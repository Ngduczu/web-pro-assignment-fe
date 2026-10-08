"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { authSessionApi } from "@/lib/api/auth-session-client";
import { clientApis } from "@/lib/api/client-apis";
import type { OAuthLoginCodeResponse } from "@/types/api";
import { FormMessage } from "@/components/auth/form-message";

export default function OAuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string>();
  const code = params.get("code");
  const state = params.get("state");

  useEffect(() => {
    if (!code || !state) return;
    const callbackCode = code;
    const callbackState = state;
    let cancelled = false;
    async function complete() {
      try {
        const payload = await clientApis.auth.oauthCallback("Google", { code: callbackCode, state: callbackState }) as OAuthLoginCodeResponse;
        if (!payload.loginCode) throw new Error("Google sign in did not return a login code.");
        await authSessionApi.redeemLoginCode({ loginCode: payload.loginCode });
        if (!cancelled) router.push("/");
      } catch (caught) {
        if (!cancelled) setError(caught instanceof ApiError ? caught.detail : "Unable to complete Google sign in.");
      }
    }
    void complete();
    return () => { cancelled = true; };
  }, [code, router, state]);

  const displayError = error ?? (!code || !state ? "Google sign in was missing required callback parameters." : undefined);
  return <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4"><div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-background p-8 text-center shadow-sm"><h1 className="text-xl font-semibold">Completing sign in</h1>{displayError ? <><FormMessage message={displayError} /><a href="/login" className="inline-block text-sm font-medium text-primary hover:underline">Return to sign in</a></> : <p className="text-sm text-muted-foreground">Verifying your Google account...</p>}</div></main>;
}
