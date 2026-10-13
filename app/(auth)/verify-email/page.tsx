"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { verifyEmailSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";
import { RequiredMark } from "@/components/ui/form-field-feedback";
import { LoaderCircle, MailCheck } from "lucide-react";

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

const copy = {
  en: { verifiedQuestion: "Already verified?", verified: "Email verified. You can now sign in.", verifyFailure: "Unable to verify this email.", invalidCode: "The verification code is invalid or has expired. Request a new code and try again.", activationHelp: "Request a new code below if you no longer have a valid verification code for this account.", enterEmail: "Enter a valid email before requesting another code.", resent: "A new verification code has been sent. Check your inbox and enter it below.", resendFailure: "Unable to resend the code.", alreadyActive: "This account is already active. Please sign in instead.", oauthAccount: "This email uses Google sign-in and does not require an activation code.", resendCooldown: "A verification code was sent recently. Please wait a moment before requesting another one.", resendIn: "Request another code in", resending: "Sending code...", resend: "Send a new verification code", loading: "Loading verification form..." },
  vi: { verifiedQuestion: "Bạn đã xác thực?", verified: "Email đã được xác thực. Bạn có thể đăng nhập ngay.", verifyFailure: "Không thể xác thực email này.", invalidCode: "Mã xác thực không hợp lệ hoặc đã hết hạn. Hãy yêu cầu mã mới rồi thử lại.", activationHelp: "Nếu không còn mã xác thực hợp lệ, hãy yêu cầu mã mới cho tài khoản này ở bên dưới.", enterEmail: "Vui lòng nhập email hợp lệ trước khi yêu cầu mã khác.", resent: "Mã xác thực mới đã được gửi. Hãy kiểm tra hộp thư và nhập mã bên dưới.", resendFailure: "Không thể gửi lại mã xác thực.", alreadyActive: "Tài khoản này đã được kích hoạt. Vui lòng chuyển sang đăng nhập.", oauthAccount: "Email này sử dụng đăng nhập Google và không cần mã kích hoạt.", resendCooldown: "Mã xác thực vừa được gửi gần đây. Vui lòng đợi một lát trước khi yêu cầu mã khác.", resendIn: "Có thể gửi mã khác sau", resending: "Đang gửi mã...", resend: "Gửi mã xác thực mới", loading: "Đang tải biểu mẫu xác thực..." },
};

const ACTIVE_ACCOUNT_DETAIL = "Only inactive accounts can request a verification code.";
const VERIFY_ACTIVE_ACCOUNT_DETAIL = "Only inactive accounts can be verified.";
const OAUTH_ACCOUNT_DETAIL = "OAuth accounts do not require email verification.";
const INVALID_CODE_DETAIL = "Verification code is invalid or expired.";
const RESEND_COOLDOWN_DETAIL = "Please wait before requesting another verification code.";

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<"verified" | "resent">();
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const { control, register, handleSubmit, getValues, setFocus, setValue, trigger, formState: { errors, isSubmitting } } = useForm<VerifyEmailValues>({ resolver: zodResolver(verifyEmailSchema), defaultValues: { email: "", verificationCode: "" } });
  const verificationCode = useWatch({ control, name: "verificationCode" });
  const activationRecovery = params.get("activation") === "1";
  const codeRegistration = register("verificationCode", {
    onChange: (event) => {
      const value = event.target.value.toUpperCase();
      event.target.value = value;
      setValue("verificationCode", value, { shouldValidate: true });
    },
  });
  useEffect(() => { const email = params.get("email"); if (email) setValue("email", email); }, [params, setValue]);
  useEffect(() => { if (cooldown <= 0) return; const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [cooldown]);
  useEffect(() => {
    if (success !== "verified") return;
    const timer = window.setTimeout(() => router.replace("/login"), 3000);
    return () => window.clearTimeout(timer);
  }, [router, success]);

  async function onSubmit(values: VerifyEmailValues) {
    setServerError(undefined);
    setSuccess(undefined);
    try {
      await clientApis.auth.verifyEmail(values);
      setSuccess("verified");
    } catch (error) {
      if (error instanceof ApiError && error.detail === VERIFY_ACTIVE_ACCOUNT_DETAIL) setServerError(text.alreadyActive);
      else if (error instanceof ApiError && error.detail === OAUTH_ACCOUNT_DETAIL) setServerError(text.oauthAccount);
      else if (error instanceof ApiError && error.detail === INVALID_CODE_DETAIL) { setServerError(text.invalidCode); setFocus("verificationCode"); }
      else setServerError(language === "en" && error instanceof ApiError ? error.detail : text.verifyFailure);
    }
  }
  async function resend() {
    const emailValid = await trigger("email");
    if (!emailValid) { setServerError(text.enterEmail); setFocus("email"); return; }
    const email = getValues("email").trim();
    setIsResending(true);
    setServerError(undefined);
    setSuccess(undefined);
    try {
      await clientApis.auth.resendVerification({ email });
      setValue("verificationCode", "");
      setCooldown(60);
      setSuccess("resent");
      codeInputRef.current?.focus();
    } catch (error) {
      if (error instanceof ApiError && error.detail === ACTIVE_ACCOUNT_DETAIL) setServerError(text.alreadyActive);
      else if (error instanceof ApiError && error.detail === OAUTH_ACCOUNT_DETAIL) setServerError(text.oauthAccount);
      else if (error instanceof ApiError && error.detail === RESEND_COOLDOWN_DETAIL) setServerError(text.resendCooldown);
      else setServerError(language === "en" && error instanceof ApiError ? error.detail : text.resendFailure);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell title={t("verifyEmailTitle")} description={t("verifyEmailDescription")} footer={<span>{text.verifiedQuestion} <Link href="/login" className="font-medium text-primary hover:underline">{t("signIn")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} /><FormMessage message={success ? text[success] : undefined} tone="success" />
        {activationRecovery ? <p className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">{text.activationHelp}</p> : null}
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}<RequiredMark /></label><input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "verify-email-error" : undefined} {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive" />{errors.email ? <p id="verify-email-error" className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2">
          <label htmlFor="verificationCode" className="text-sm font-medium">{t("verificationCode")}<RequiredMark /></label>
          <div className="relative grid grid-cols-6 gap-2 rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" onClick={() => codeInputRef.current?.focus()}>
            <input
              {...codeRegistration}
              id="verificationCode"
              ref={(element) => { codeRegistration.ref(element); codeInputRef.current = element; }}
              maxLength={6}
              inputMode="text"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              aria-invalid={Boolean(errors.verificationCode)}
              aria-describedby={errors.verificationCode ? "verificationCode-error" : undefined}
              className="absolute inset-0 z-10 size-full cursor-text opacity-0"
            />
            {Array.from({ length: 6 }, (_, index) => {
              const character = verificationCode[index];
              return (
                <span
                  key={`${index}-${character ?? "empty"}`}
                  aria-hidden="true"
                  className={`flex h-12 min-w-0 items-center justify-center rounded-md border bg-background font-mono text-lg font-semibold transition-[border-color,background-color,transform,box-shadow] duration-150 ${character ? "border-primary/60 bg-primary/5 code-slot-enter" : "border-input"}`}
                >
                  {character ?? ""}
                </span>
              );
            })}
          </div>
          {errors.verificationCode ? <p id="verificationCode-error" className="text-xs text-destructive">{localizeAuthMessage(language, errors.verificationCode.message)}</p> : null}
        </div>
        <AuthSubmit loading={isSubmitting} disabled={isResending}>{t("verifyEmail")}</AuthSubmit>
        <button type="button" disabled={cooldown > 0 || isSubmitting || isResending} onClick={resend} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-55">{isResending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <MailCheck className="size-4" aria-hidden="true" />}{isResending ? text.resending : cooldown > 0 ? `${text.resendIn} ${cooldown}s` : text.resend}</button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<VerifyEmailLoading />}><VerifyEmailForm /></Suspense>;
}

function VerifyEmailLoading() {
  const { language } = useLanguage();
  return <div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">{copy[language].loading}</div>;
}
