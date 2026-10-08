"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { UserProfileDto } from "@/types/api";

const copy = {
  en: { title: "Profile changes", description: "Update the name and phone number shown across your workspace.", edit: "Edit profile", dialog: "Edit personal profile", fullName: "Full name", phone: "Phone", optional: "Optional", cancel: "Cancel", save: "Save changes", saving: "Saving...", success: "Profile updated successfully.", failure: "Unable to update your profile." },
  vi: { title: "Thay đổi hồ sơ", description: "Cập nhật tên và số điện thoại hiển thị trong không gian làm việc.", edit: "Chỉnh sửa hồ sơ", dialog: "Chỉnh sửa hồ sơ cá nhân", fullName: "Họ và tên", phone: "Số điện thoại", optional: "Không bắt buộc", cancel: "Hủy", save: "Lưu thay đổi", saving: "Đang lưu...", success: "Cập nhật hồ sơ thành công.", failure: "Không thể cập nhật hồ sơ." },
};

export function ProfileEditor({ user }: { user: UserProfileDto }) {
  const router = useRouter(); const { language } = useLanguage(); const text = copy[language];
  const [open, setOpen] = useState(false), [fullName, setFullName] = useState(user.fullName), [phone, setPhone] = useState(user.phone ?? "");
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>(), [success, setSuccess] = useState<string>();
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(undefined); setSuccess(undefined); try { await clientApis.users.updateMe({ fullName, phone: phone.trim() || null }); setOpen(false); setSuccess(text.success); router.refresh(); } catch (caught) { setError(caught instanceof ApiError ? caught.detail : text.failure); } finally { setBusy(false); } }
  return <><aside className="border border-border bg-muted/25 p-6"><Pencil className="size-5 text-primary" /><h2 className="mt-4 font-semibold">{text.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text.description}</p>{success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}<button onClick={() => { setError(undefined); setOpen(true); }} className="mt-5 w-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{text.edit}</button></aside>{open ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label={text.cancel} /><form onSubmit={submit} className="relative w-full max-w-md border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">{text.dialog}</h2><p className="mt-1 text-sm text-muted-foreground">{user.email}</p></div><button type="button" onClick={() => setOpen(false)}><X className="size-5" /></button></div><div className="mt-6 space-y-4"><label className="grid gap-2 text-sm font-medium">{text.fullName}<input required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.phone} <span className="text-xs font-normal text-muted-foreground">({text.optional})</span><input maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label>{error ? <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}</div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setOpen(false)} className="h-10 border border-border px-4 text-sm font-medium">{text.cancel}</button><button disabled={busy} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? text.saving : text.save}</button></div></form></div> : null}</>;
}
