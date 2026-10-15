"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleX, LoaderCircle } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { authSessionApi } from "@/lib/api/auth-session-client";
import { clientApis } from "@/lib/api/client-apis";
import type { OAuthLoginCodeResponse } from "@/types/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: {
    missingCode: "Google sign in did not return a login code.",
    failure: "Unable to complete Google sign in.",
    missingParams: "Google sign in was missing required callback parameters.",
    completing: "Completing sign in",
    completingDescription: "Please wait while we securely connect your Google account.",
    back: "Return to sign in",
    verifying: "Verifying your Google account...",
    cancelledTitle: "Sign-in cancelled",
    cancelledDescription: "Google sign-in was not completed.",
    cancelledHelp: "You chose not to continue with Google. No changes were made to your account.",
    errorTitle: "Google sign-in was not completed",
    errorDescription: "We could not finish connecting your Google account.",
    errorHelp: "Something interrupted the Google sign-in process. Return to sign in and try again.",
  },
  vi: {
    missingCode: "Google không trả về mã đăng nhập.",
    failure: "Không thể hoàn tất đăng nhập bằng Google.",
    missingParams: "Luồng đăng nhập Google thiếu tham số phản hồi bắt buộc.",
    completing: "Đang hoàn tất đăng nhập",
    completingDescription: "Vui lòng đợi trong khi SFIT Study kết nối an toàn với tài khoản Google của bạn.",
    back: "Quay lại đăng nhập",
    verifying: "Đang xác minh tài khoản Google của bạn...",
    cancelledTitle: "Đã hủy đăng nhập",
    cancelledDescription: "Quá trình đăng nhập Google chưa được hoàn tất.",
    cancelledHelp: "Bạn đã chọn không tiếp tục với Google. Tài khoản của bạn không có thay đổi nào.",
    errorTitle: "Chưa thể đăng nhập bằng Google",
    errorDescription: "SFIT Study chưa thể kết nối với tài khoản Google của bạn.",
    errorHelp: "Quá trình đăng nhập Google đã bị gián đoạn. Hãy quay lại và thử đăng nhập lần nữa.",
  },
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
  const providerError = params.get("error");

  useEffect(() => {
    if (providerError || (!loginCode && (!code || !state))) return;
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
  }, [code, language, loginCode, providerError, router, state, text.failure, text.missingCode]);

  const displayError = error ?? (!providerError && !loginCode && (!code || !state) ? text.missingParams : undefined);
  const wasCancelled = providerError === "access_denied";

  if (providerError || displayError) {
    const title = wasCancelled ? text.cancelledTitle : text.errorTitle;
    const description = wasCancelled ? text.cancelledDescription : providerError ? text.errorDescription : displayError!;
    const help = wasCancelled ? text.cancelledHelp : text.errorHelp;
    return (
      <AuthShell title={title} description={description} mascotSrc="/assets/owlie/sad.webp">
        <div className="space-y-5">
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 text-left">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CircleX className="size-5" aria-hidden="true" />
            </span>
            <p className="pt-0.5 text-sm leading-6 text-muted-foreground">{help}</p>
          </div>
          <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {text.back}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={text.completing} description={text.completingDescription} mascotSrc="/assets/owlie/think.webp">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
        <span>{text.verifying}</span>
      </div>
    </AuthShell>
  );
}
