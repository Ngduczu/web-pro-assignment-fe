"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api/errors";
import { authSessionApi } from "@/lib/api/auth-session-client";
import { clientApis } from "@/lib/api/client-apis";
import { loginSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import type { z } from "zod";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";

type LoginValues = z.infer<typeof loginSchema>;

const copy = {
  en: { signInFailure: "Unable to sign in. Please try again.", googleFailure: "Unable to start Google sign in.", separator: "OR" },
  vi: { signInFailure: "Không thể đăng nhập. Vui lòng thử lại.", googleFailure: "Không thể bắt đầu đăng nhập bằng Google.", separator: "HOẶC" },
};

export default function LoginPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [serverError, setServerError] = useState<string>();
  const [oauthLoading, setOauthLoading] = useState(false);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const passwordField = register("password");
  const password = useWatch({ control, name: "password" });

  async function onSubmit(values: LoginValues) {
    setServerError(undefined);
    try {
      await authSessionApi.login(values);
      router.push("/");
    } catch (error) {
      setServerError(language === "en" && error instanceof ApiError ? error.detail : text.signInFailure);
    }
  }

  async function startGoogleLogin() {
    setOauthLoading(true);
    setServerError(undefined);
    try {
      const result = await clientApis.auth.oauthAuthorize("Google");
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setServerError(language === "en" && error instanceof ApiError ? error.detail : text.googleFailure);
      setOauthLoading(false);
    }
  }

  return (
    <AuthShell title={t("welcomeBack")} description={t("learningWorkspace")} footer={<span>{t("newToSfit")} <Link href="/register" className="font-medium text-primary hover:underline">{t("createAccount")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">{t("password")}</label><Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("forgotPassword")}</Link></div><PasswordInput id="password" {...passwordField} value={password} autoComplete="current-password" />{errors.password ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.password.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("signIn")}</AuthSubmit>
        <div className="relative flex items-center"><div className="h-px flex-1 bg-border" /><span className="px-3 text-xs text-muted-foreground">{text.separator}</span><div className="h-px flex-1 bg-border" /></div>
        <button type="button" onClick={startGoogleLogin} disabled={oauthLoading || isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"><FcGoogle className="size-5" aria-hidden="true" />{oauthLoading ? t("connecting") : t("continueWithGoogle")}</button>
      </form>
    </AuthShell>
  );
}
