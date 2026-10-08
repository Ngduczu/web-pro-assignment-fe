"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";

type ResetValues = z.infer<typeof resetPasswordSchema>;

const copy = {
  en: { anotherCode: "Need another reset code?", success: "Password reset successfully. Redirecting to sign in...", failure: "Unable to reset your password.", confirm: "Confirm new password", loading: "Loading reset form..." },
  vi: { anotherCode: "Bạn cần mã đặt lại khác?", success: "Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...", failure: "Không thể đặt lại mật khẩu.", confirm: "Xác nhận mật khẩu mới", loading: "Đang tải biểu mẫu đặt lại mật khẩu..." },
};

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<ResetValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { email: "", resetCode: "", newPassword: "", passwordConfirm: "" } });
  const passwordField = register("newPassword");
  const confirmField = register("passwordConfirm");
  const newPassword = useWatch({ control, name: "newPassword" });
  const passwordConfirm = useWatch({ control, name: "passwordConfirm" });
  useEffect(() => { const email = params.get("email"); const code = params.get("code"); if (email) setValue("email", email); if (code) setValue("resetCode", code.toUpperCase()); }, [params, setValue]);

  async function onSubmit(values: ResetValues) {
    setServerError(undefined);
    try { await clientApis.auth.resetPassword(values); setSuccess(true); window.setTimeout(() => router.push("/login"), 900); } catch (error) { setServerError(language === "en" && error instanceof ApiError ? error.detail : text.failure); }
  }

  return (
    <AuthShell title={t("resetPasswordTitle")} description={t("resetPasswordDescription")} footer={<span>{text.anotherCode} <Link href="/forgot-password" className="font-medium text-primary hover:underline">{t("requestAnother")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} /><FormMessage message={success ? text.success : undefined} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="resetCode" className="text-sm font-medium">{t("resetCode")}</label><input id="resetCode" maxLength={6} {...register("resetCode")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.resetCode ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.resetCode.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="newPassword" className="text-sm font-medium">{t("newPassword")}</label><PasswordInput id="newPassword" {...passwordField} value={newPassword} autoComplete="new-password" />{errors.newPassword ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.newPassword.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="passwordConfirm" className="text-sm font-medium">{text.confirm}</label><PasswordInput id="passwordConfirm" {...confirmField} value={passwordConfirm} placeholder={text.confirm} autoComplete="new-password" />{errors.passwordConfirm ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.passwordConfirm.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("resetPassword")}</AuthSubmit>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<ResetPasswordLoading />}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordLoading() {
  const { language } = useLanguage();
  return <div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">{copy[language].loading}</div>;
}
