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

 type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

export default function VerifyCodePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyCodeValues>({ resolver: zodResolver(verifyCodeSchema), defaultValues: { email: "", code: "" } });
  function onSubmit(values: VerifyCodeValues) { router.push(`/reset-password?email=${encodeURIComponent(values.email)}&code=${encodeURIComponent(values.code.toUpperCase())}`); }

  return (
    <AuthShell title="Verify reset code" description="Enter the six-character code from your password reset email." footer={<span>Need a new code? <Link href="/forgot-password" className="font-medium text-primary hover:underline">Request another</Link></span>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormMessage message="The code will be checked when you set your new password." tone="success" />
        <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="code" className="text-sm font-medium">Reset code</label><input id="code" inputMode="text" maxLength={6} {...register("code", { onChange: (event) => { event.target.value = event.target.value.toUpperCase(); } })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ring" />{errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}</div>
        <AuthSubmit loading={isSubmitting}>Continue</AuthSubmit>
      </form>
    </AuthShell>
  );
}
