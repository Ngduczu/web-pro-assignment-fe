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

 type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
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
      setServerError(error instanceof ApiError ? error.detail : "Unable to sign in. Please try again.");
    }
  }

  async function startGoogleLogin() {
    setOauthLoading(true);
    setServerError(undefined);
    try {
      const result = await clientApis.auth.oauthAuthorize("Google");
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.detail : "Unable to start Google sign in.");
      setOauthLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to continue to your learning workspace." footer={<span>New to LMS? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message={serverError} />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" autoComplete="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Password</label><Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link></div><PasswordInput id="password" {...passwordField} value={password} autoComplete="current-password" />{errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>Sign in</AuthSubmit>
        <div className="relative flex items-center"><div className="h-px flex-1 bg-border" /><span className="px-3 text-xs text-muted-foreground">OR</span><div className="h-px flex-1 bg-border" /></div>
        <button type="button" onClick={startGoogleLogin} disabled={oauthLoading || isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"><FcGoogle className="size-5" aria-hidden="true" />{oauthLoading ? "Connecting..." : "Continue with Google"}</button>
      </form>
    </AuthShell>
  );
}
