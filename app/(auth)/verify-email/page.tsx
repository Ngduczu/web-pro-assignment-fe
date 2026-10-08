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

 type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

function VerifyEmailForm() {
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [cooldown, setCooldown] = useState(0);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<VerifyEmailValues>({ resolver: zodResolver(verifyEmailSchema), defaultValues: { email: "", verificationCode: "" } });
  useEffect(() => { const email = params.get("email"); if (email) setValue("email", email); }, [params, setValue]);
  useEffect(() => { if (cooldown <= 0) return; const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [cooldown]);

  async function onSubmit(values: VerifyEmailValues) {
    setServerError(undefined);
    try {
      await clientApis.auth.verifyEmail(values);
      setSuccess("Email verified. You can now sign in.");
    } catch (error) {
      setServerError(error instanceof ApiError ? error.detail : "Unable to verify this email.");
    }
  }
  async function resend() {
    const email = document.getElementById("email") as HTMLInputElement | null;
    if (!email?.value) { setServerError("Enter your email before requesting another code."); return; }
    setServerError(undefined);
    try { await clientApis.auth.resendVerification({ email: email.value }); setCooldown(60); setSuccess("A new verification code has been sent."); } catch (error) { setServerError(error instanceof ApiError ? error.detail : "Unable to resend the code."); }
  }

  return (
    <AuthShell title="Verify your email" description="Enter the six-character code sent to your email address." footer={<span>Already verified? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} /><FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="verificationCode" className="text-sm font-medium">Verification code</label><input id="verificationCode" maxLength={6} inputMode="text" {...register("verificationCode", { onChange: (event) => { event.target.value = event.target.value.toUpperCase(); } })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.verificationCode ? <p className="text-xs text-destructive">{errors.verificationCode.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>Verify email</AuthSubmit>
        <button type="button" disabled={cooldown > 0} onClick={resend} className="w-full text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground">{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification code"}</button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">Loading verification form...</div>}><VerifyEmailForm /></Suspense>;
}
