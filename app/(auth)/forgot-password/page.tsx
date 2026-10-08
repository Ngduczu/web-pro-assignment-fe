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

 type ForgotValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [cooldown, setCooldown] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  useEffect(() => { if (cooldown <= 0) return; const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000); return () => window.clearInterval(timer); }, [cooldown]);

  async function onSubmit(values: ForgotValues) {
    setServerError(undefined);
    try {
      const result = await clientApis.auth.forgotPassword(values);
      setSuccess(result.accepted ? "If an active local account exists, a reset code has been sent. Check your email." : "Request accepted.");
      setCooldown(60);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.detail : "Unable to request a reset code.");
    }
  }

  return (
    <AuthShell title="Forgot password" description="Enter your email and we will send a password reset code." footer={<span>Remembered your password? <Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting || cooldown > 0}>{cooldown > 0 ? `Try again in ${cooldown}s` : "Send reset code"}</AuthSubmit>
        <p className="text-xs leading-5 text-muted-foreground">For account privacy, the response does not reveal whether an email exists.</p>
      </form>
    </AuthShell>
  );
}
