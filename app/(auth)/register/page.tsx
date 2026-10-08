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

 type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { email: "", password: "", passwordConfirm: "" } });
  const passwordField = register("password");
  const confirmField = register("passwordConfirm");
  const password = useWatch({ control, name: "password" });
  const passwordConfirm = useWatch({ control, name: "passwordConfirm" });

  async function onSubmit(values: RegisterValues) {
    setServerError(undefined);
    try {
      const result = await clientApis.auth.register(values);
      setSuccess(`Verification code sent. It expires at ${new Date(result.verificationCodeExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.detail : "Unable to create your account.");
    }
  }

  return (
    <AuthShell title="Create your account" description="Register as a student and verify your email to get started." footer={<span>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <FormMessage message={success} tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Password</label><PasswordInput id="password" {...passwordField} value={password} autoComplete="new-password" />{errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="passwordConfirm" className="text-sm font-medium">Confirm password</label><PasswordInput id="passwordConfirm" {...confirmField} value={passwordConfirm} placeholder="Confirm password" autoComplete="new-password" />{errors.passwordConfirm ? <p className="text-xs text-destructive">{errors.passwordConfirm.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>Create account</AuthSubmit>
      </form>
    </AuthShell>
  );
}
