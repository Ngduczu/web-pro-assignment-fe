import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required.").max(255, "Email must be 255 characters or fewer.").email("Enter a valid email address.");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters.").max(128, "Password must be 128 characters or fewer.");
export const humanCodeSchema = z.string().trim().length(6, "Code must contain exactly 6 characters.").regex(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/i, "Code contains unsupported characters.");

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Password is required.") });
export const registerSchema = z.object({ email: emailSchema, password: passwordSchema, passwordConfirm: z.string().min(1, "Confirm your password.") }).refine((data) => data.password === data.passwordConfirm, { path: ["passwordConfirm"], message: "Passwords do not match." });
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const verifyCodeSchema = z.object({ email: emailSchema, code: humanCodeSchema });
export const resetPasswordSchema = z.object({ email: emailSchema, resetCode: humanCodeSchema, newPassword: passwordSchema, passwordConfirm: z.string().min(1, "Confirm your password.") }).refine((data) => data.newPassword === data.passwordConfirm, { path: ["passwordConfirm"], message: "Passwords do not match." });
export const verifyEmailSchema = z.object({ email: emailSchema, verificationCode: humanCodeSchema });
