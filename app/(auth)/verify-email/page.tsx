"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

const copy = {
  en: { verifiedQuestion: "Already verified?", verified: "Email verified. You can now sign in.", verifyFailure: "Unable to verify this email.", enterEmail: "Enter your email before requesting another code.", resent: "A new verification code has been sent.", resendFailure: "Unable to resend the code.", resendIn: "Resend in", resend: "Resend verification code", loading: "Loading verification form..." },
  vi: { verifiedQuestion: "Bạn đã xác thực?", verified: "Email đã được xác thực. Bạn có thể đăng nhập ngay.", verifyFailure: "Không thể xác thực email này.", enterEmail: "Vui lòng nhập email trước khi yêu cầu mã khác.", resent: "Mã xác thực mới đã được gửi.", resendFailure: "Không thể gửi lại mã xác thực.", resendIn: "Gửi lại sau", resend: "Gửi lại mã xác thực", loading: "Đang tải biểu mẫu xác thực..." },
};

function VerifyEmailForm() {
  const params = useSearchParams();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<"verified" | "resent">();
  const [cooldown, setCooldown] = useState(0);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<VerifyEmailValues>({ resolver: zodResolver(verifyEmailSchema), defaultValues: { email: "", verificationCode: "" } });
  useEffect(() => { const email = params.get("email"); if (email) setValue("email", email); }, [params, setValue]);
  useEffect(() => { if (cooldown <= 0) return; const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [cooldown]);

  async function onSubmit(values: VerifyEmailValues) {
    setServerError(undefined);
    try {
      await clientApis.auth.verifyEmail(values);
      setSuccess("verified");
    } catch (error) {
      setServerError(language === "en" && error instanceof ApiError ? error.detail : text.verifyFailure);
    }
  }
  async function resend() {
    const email = document.getElementById("email") as HTMLInputElement | null;
    if (!email?.value) { setServerError(text.enterEmail); return; }
    setServerError(undefined);
    try { await clientApis.auth.resendVerification({ email: email.value }); setCooldown(60); setSuccess("resent"); } catch (error) { setServerError(language === "en" && error instanceof ApiError ? error.detail : text.resendFailure); }
  }

  return (
    <AuthShell title={t("verifyEmailTitle")} description={t("verifyEmailDescription")} footer={<span>{text.verifiedQuestion} <Link href="/login" className="font-medium text-primary hover:underline">{t("signIn")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} /><FormMessage message={success ? text[success] : undefined} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="verificationCode" className="text-sm font-medium">{t("verificationCode")}</label><input id="verificationCode" maxLength={6} inputMode="text" {...register("verificationCode", { onChange: (event) => { event.target.value = event.target.value.toUpperCase(); } })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.verificationCode ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.verificationCode.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("verifyEmail")}</AuthSubmit>
        <button type="button" disabled={cooldown > 0} onClick={resend} className="w-full text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground">{cooldown > 0 ? `${text.resendIn} ${cooldown}s` : text.resend}</button>
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
