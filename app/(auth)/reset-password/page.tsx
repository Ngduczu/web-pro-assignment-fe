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

 type ResetValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<ResetValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { email: "", resetCode: "", newPassword: "", passwordConfirm: "" } });
  const passwordField = register("newPassword");
  const confirmField = register("passwordConfirm");
  const newPassword = useWatch({ control, name: "newPassword" });
  const passwordConfirm = useWatch({ control, name: "passwordConfirm" });
  useEffect(() => { const email = params.get("email"); const code = params.get("code"); if (email) setValue("email", email); if (code) setValue("resetCode", code.toUpperCase()); }, [params, setValue]);

  async function onSubmit(values: ResetValues) {
    setServerError(undefined);
    try { await clientApis.auth.resetPassword(values); setSuccess("Password reset successfully. Redirecting to sign in..."); window.setTimeout(() => router.push("/login"), 900); } catch (error) { setServerError(error instanceof ApiError ? error.detail : "Unable to reset your password."); }
  }

  return (
    <AuthShell title="Set a new password" description="Use your reset code and choose a new password between 8 and 128 characters." footer={<span>Need another reset code? <Link href="/forgot-password" className="font-medium text-primary hover:underline">Start again</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} /><FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="resetCode" className="text-sm font-medium">Reset code</label><input id="resetCode" maxLength={6} {...register("resetCode")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.resetCode ? <p className="text-xs text-destructive">{errors.resetCode.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="newPassword" className="text-sm font-medium">New password</label><PasswordInput id="newPassword" {...passwordField} value={newPassword} autoComplete="new-password" />{errors.newPassword ? <p className="text-xs text-destructive">{errors.newPassword.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="passwordConfirm" className="text-sm font-medium">Confirm new password</label><PasswordInput id="passwordConfirm" {...confirmField} value={passwordConfirm} placeholder="Confirm new password" autoComplete="new-password" />{errors.passwordConfirm ? <p className="text-xs text-destructive">{errors.passwordConfirm.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>Reset password</AuthSubmit>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">Loading reset form...</div>}><ResetPasswordForm /></Suspense>;
}
