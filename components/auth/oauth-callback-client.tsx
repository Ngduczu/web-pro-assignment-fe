"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { authSessionApi } from "@/lib/api/auth-session-client";
import { clientApis } from "@/lib/api/client-apis";
import type { OAuthLoginCodeResponse } from "@/types/api";
import { FormMessage } from "@/components/auth/form-message";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: { missingCode: "Google sign in did not return a login code.", failure: "Unable to complete Google sign in.", missingParams: "Google sign in was missing required callback parameters.", completing: "Completing sign in", back: "Return to sign in", verifying: "Verifying your Google account..." },
  vi: { missingCode: "Google không trả về mã đăng nhập.", failure: "Không thể hoàn tất đăng nhập bằng Google.", missingParams: "Luồng đăng nhập Google thiếu tham số phản hồi bắt buộc.", completing: "Đang hoàn tất đăng nhập", back: "Quay lại đăng nhập", verifying: "Đang xác minh tài khoản Google của bạn..." },
};

export default function OAuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { language } = useLanguage();
  const text = copy[language];
  const [error, setError] = useState<string>();
  const startedCallbackRef = useRef<string | undefined>(undefined);
  const code = params.get("code");
  const state = params.get("state");
  const loginCode = params.get("loginCode");

  useEffect(() => {
    if (!loginCode && (!code || !state)) return;
    const callbackKey = loginCode ?? `${code}:${state}`;
    if (startedCallbackRef.current === callbackKey) return;
    startedCallbackRef.current = callbackKey;
    const storageKey = `lms:oauth-login:${callbackKey}`;
    try {
      if (sessionStorage.getItem(storageKey) === "pending" || sessionStorage.getItem(storageKey) === "completed") return;
      sessionStorage.setItem(storageKey, "pending");
    } catch {
      // Continue when browser storage is unavailable.
    }
    const callbackCode = code;
    const callbackState = state;
    const callbackLoginCode = loginCode;
    async function complete() {
      try {
        const payload = callbackLoginCode
          ? { loginCode: callbackLoginCode }
          : await clientApis.auth.oauthCallback("Google", { code: callbackCode!, state: callbackState! }) as OAuthLoginCodeResponse;
        if (!payload.loginCode) throw new Error(text.missingCode);
        await authSessionApi.redeemLoginCode({ loginCode: payload.loginCode });
        try { sessionStorage.setItem(storageKey, "completed"); } catch {}
        router.replace("/");
      } catch (caught) {
        try { sessionStorage.removeItem(storageKey); } catch {}
        setError(language === "en" && caught instanceof ApiError ? caught.detail : text.failure);
      }
    }
    void complete();
  }, [code, language, loginCode, router, state, text.failure, text.missingCode]);

  const displayError = error ?? (!loginCode && (!code || !state) ? text.missingParams : undefined);
  return <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4"><div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-background p-8 text-center shadow-sm"><h1 className="text-xl font-semibold">{text.completing}</h1>{displayError ? <><FormMessage message={displayError} /><a href="/login" className="inline-block text-sm font-medium text-primary hover:underline">{text.back}</a></> : <p className="text-sm text-muted-foreground">{text.verifying}</p>}</div></main>;
}
