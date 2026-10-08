"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { registerSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";

type RegisterValues = z.infer<typeof registerSchema>;

const copy = {
  en: { sent: "Verification code sent. It expires at", failure: "Unable to create your account." },
  vi: { sent: "Mã xác thực đã được gửi. Mã hết hạn lúc", failure: "Không thể tạo tài khoản của bạn." },
};

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { email: "", password: "", passwordConfirm: "" } });
  const passwordField = register("password");
  const confirmField = register("passwordConfirm");
  const password = useWatch({ control, name: "password" });
  const passwordConfirm = useWatch({ control, name: "passwordConfirm" });

  async function onSubmit(values: RegisterValues) {
    setServerError(undefined);
    try {
      const result = await clientApis.auth.register(values);
      setSuccess(`${text.sent} ${new Date(result.verificationCodeExpiresAt).toLocaleTimeString(language === "vi" ? "vi-VN" : "en", { hour: "2-digit", minute: "2-digit" })}.`);
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      setServerError(language === "en" && error instanceof ApiError ? error.detail : text.failure);
    }
  }

  return (
    <AuthShell title={t("registerTitle")} description={t("registerDescription")} footer={<span>{t("alreadyHaveAccount")} <Link href="/login" className="font-medium text-primary hover:underline">{t("signIn")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">{t("password")}</label><PasswordInput id="password" {...passwordField} value={password} autoComplete="new-password" />{errors.password ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.password.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="passwordConfirm" className="text-sm font-medium">{t("confirmPassword")}</label><PasswordInput id="passwordConfirm" {...confirmField} value={passwordConfirm} placeholder={t("confirmPassword")} autoComplete="new-password" />{errors.passwordConfirm ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.passwordConfirm.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("createAccount")}</AuthSubmit>
      </form>
    </AuthShell>
  );
}
