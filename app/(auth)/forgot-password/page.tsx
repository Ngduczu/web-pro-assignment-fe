"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";

type ForgotValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<"sent" | "accepted">();
  const [cooldown, setCooldown] = useState(0);
  const { language, t } = useLanguage();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  useEffect(() => { if (cooldown <= 0) return; const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [cooldown]);

  async function onSubmit(values: ForgotValues) {
    setServerError(undefined);
    try {
      const result = await clientApis.auth.forgotPassword(values);
      setSuccess(result.accepted ? "sent" : "accepted");
      setCooldown(60);
    } catch (error) {
      setServerError(language === "en" && error instanceof ApiError ? error.detail : t("resetCodeRequestFailed"));
    }
  }

  return (
    <AuthShell title={t("forgotPasswordTitle")} description={t("forgotPasswordDescription")} footer={<span>{t("rememberedPassword")} <Link href="/login" className="font-medium text-primary hover:underline">{t("backToSignIn")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <FormMessage message={success ? t(success === "sent" ? "resetCodeSent" : "resetRequestAccepted") : undefined} tone="success" />
        {success ? (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="text-muted-foreground">{language === "vi" ? "Đã nhận được mã xác nhận trong email?" : "Received the code in your email?"}</p>
            <Link
              href={`/reset-password?email=${encodeURIComponent(document.getElementById("email") instanceof HTMLInputElement ? (document.getElementById("email") as HTMLInputElement).value : "")}`}
              className="mt-1 inline-block font-semibold text-primary hover:underline"
            >
              {language === "vi" ? "Tiếp tục đặt lại mật khẩu →" : "Proceed to reset password →"}
            </Link>
          </div>
        ) : null}
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting} disabled={cooldown > 0}>{cooldown > 0 ? `${t("retryIn")} ${cooldown}s` : t("sendResetCode")}</AuthSubmit>
        <p className="text-xs leading-5 text-muted-foreground">{t("accountPrivacyNotice")}</p>
      </form>
    </AuthShell>
  );
}
