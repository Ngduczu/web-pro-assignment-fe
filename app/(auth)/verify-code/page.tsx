"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { verifyCodeSchema } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { FormMessage } from "@/components/auth/form-message";
import { useLanguage } from "@/lib/i18n";
import { localizeAuthMessage } from "@/lib/auth/localized-message";

type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

const copy = {
  en: { needCode: "Need a new code?", checkedLater: "The code will be checked when you set your new password." },
  vi: { needCode: "Bạn cần mã mới?", checkedLater: "Mã sẽ được kiểm tra khi bạn đặt mật khẩu mới." },
};

export default function VerifyCodePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyCodeValues>({ resolver: zodResolver(verifyCodeSchema), defaultValues: { email: "", code: "" } });
  function onSubmit(values: VerifyCodeValues) { router.push(`/reset-password?email=${encodeURIComponent(values.email)}&code=${encodeURIComponent(values.code.toUpperCase())}`); }

  return (
    <AuthShell title={t("verifyResetCodeTitle")} description={t("verifyResetCodeDescription")} footer={<span>{text.needCode} <Link href="/forgot-password" className="font-medium text-primary hover:underline">{t("requestAnother")}</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={text.checkedLater} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("email")}</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.email.message)}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="code" className="text-sm font-medium">{t("resetCode")}</label><input id="code" inputMode="text" maxLength={6} {...register("code", { onChange: (event) => { event.target.value = event.target.value.toUpperCase(); } })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.code ? <p className="text-xs text-destructive">{localizeAuthMessage(language, errors.code.message)}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>{t("continue")}</AuthSubmit>
      </form>
    </AuthShell>
  );
}
