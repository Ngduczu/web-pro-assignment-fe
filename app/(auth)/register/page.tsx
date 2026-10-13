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
import { RequiredMark } from "@/components/ui/form-field-feedback";
import { MailCheck } from "lucide-react";

type RegisterValues = z.infer<typeof registerSchema>;

const copy = {
  en: {
    sent: "Verification code sent. It expires at",
    emailExists: "This email is already registered. Please sign in or use another email.",
    failure: "Unable to create your account.",
  },
  vi: {
    sent: "Mã xác thực đã được gửi. Mã hết hạn lúc",
    emailExists: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
    failure: "Không thể tạo tài khoản của bạn.",
  },
};

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const { register, handleSubmit, control, clearErrors, setError, setFocus, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", email: "", phone: "", password: "", passwordConfirm: "" } });
  const emailField = register("email", { onChange: () => { clearErrors("email"); setServerError(undefined); } });
  const passwordField = register("password");
  const confirmField = register("passwordConfirm");
  const password = useWatch({ control, name: "password" });
  const passwordConfirm = useWatch({ control, name: "passwordConfirm" });

  async function onSubmit(values: RegisterValues) {
    setServerError(undefined);
    clearErrors("email");
    try {
      const result = await clientApis.auth.register({ ...values, phone: values.phone || null });
      setSuccess(`${text.sent} ${new Date(result.verificationCodeExpiresAt).toLocaleTimeString(language === "vi" ? "vi-VN" : "en", { hour: "2-digit", minute: "2-digit" })}.`);
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setServerError(text.emailExists);
        setError("email", { type: "server", message: text.emailExists });
        setFocus("email");
        return;
      }

      setServerError(language === "en" && error instanceof ApiError ? error.detail : text.failure);
    }
  }

  return (
    <AuthShell title={t("registerTitle")} description={t("registerDescription")} mascotSrc="/assets/owlie/cheer.webp" footer={<span>{t("alreadyHaveAccount")} <Link href="/login" className="font-medium text-primary hover:underline">{t("signIn")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}<RequiredMark /></label><input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "register-email-error" : undefined} {...emailField} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive" />{errors.email ? <p id="register-email-error" className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="fullName" className="text-sm font-medium">{t("fullName")}<RequiredMark /></label><input id="fullName" autoComplete="name" maxLength={100} {...register("fullName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.fullName ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.fullName.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="phone" className="text-sm font-medium">{t("phoneNumber")} <span className="font-normal text-muted-foreground">({t("optional")})</span></label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} {...register("phone")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.phone ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.phone.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">{t("password")}<RequiredMark /></label><PasswordInput id="password" {...passwordField} value={password} autoComplete="new-password" />{errors.password ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.password.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="passwordConfirm" className="text-sm font-medium">{t("confirmPassword")}<RequiredMark /></label><PasswordInput id="passwordConfirm" {...confirmField} value={passwordConfirm} placeholder={t("confirmPassword")} autoComplete="new-password" />{errors.passwordConfirm ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.passwordConfirm.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("createAccount")}</AuthSubmit>
        <Link href="/verify-email" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><MailCheck className="size-4" aria-hidden="true" />{t("activateAccount")}</Link>
      </form>
    </AuthShell>
  );
}
