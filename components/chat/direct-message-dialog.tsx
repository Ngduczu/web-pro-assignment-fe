"use client";

import { useState } from "react";
import { Search, UserRound, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ChatRoomDto, ChatUserSearchDto } from "@/types/api";

const copy = {
  en: { title: "New direct message", description: "Find an active user by their exact email address.", email: "Email address", search: "Search", searching: "Searching...", noUser: "No active user was found with this email.", start: "Start conversation", starting: "Opening...", cancel: "Cancel" },
  vi: { title: "Tin nhắn trực tiếp mới", description: "Tìm tài khoản đang hoạt động bằng địa chỉ email chính xác.", email: "Địa chỉ email", search: "Tìm kiếm", searching: "Đang tìm...", noUser: "Không tìm thấy tài khoản đang hoạt động với email này.", start: "Bắt đầu trò chuyện", starting: "Đang mở...", cancel: "Hủy" },
};

export function DirectMessageDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (room: ChatRoomDto, user: ChatUserSearchDto) => void }) {
  const { language } = useLanguage(); const text = copy[language];
  const [email, setEmail] = useState(""), [user, setUser] = useState<ChatUserSearchDto>();
  const [searching, setSearching] = useState(false), [starting, setStarting] = useState(false), [error, setError] = useState<string>();
  async function search(event: React.FormEvent) { event.preventDefault(); setSearching(true); setError(undefined); setUser(undefined); try { setUser(await clientApis.users.findForChat(email.trim())); } catch (caught) { setError(caught instanceof ApiError && caught.isNotFound ? text.noUser : language === "en" && caught instanceof ApiError ? caught.detail : text.noUser); } finally { setSearching(false); } }
  async function start() { if (!user) return; setStarting(true); setError(undefined); try { onCreated(await clientApis.chat.getOrCreateDirectRoom(user.id), user); } catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.noUser); setStarting(false); } }
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} aria-label={text.cancel} /><div role="dialog" aria-modal="true" className="relative w-full max-w-md border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{text.title}</h2><p className="mt-2 text-sm text-muted-foreground">{text.description}</p></div><button onClick={onClose} className="p-1 text-muted-foreground"><X className="size-5" /></button></div><form onSubmit={search} className="mt-5 flex gap-2"><label className="sr-only" htmlFor="chat-user-email">{text.email}</label><input id="chat-user-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text.email} className="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm" /><button disabled={searching} className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Search className="size-4" />{searching ? text.searching : text.search}</button></form>{error ? <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}{user ? <div className="mt-4 flex items-center gap-3 border border-border bg-muted/30 p-4"><span className="flex size-11 shrink-0 items-center justify-center bg-primary/10 text-primary"><UserRound className="size-5" /></span><div className="min-w-0 flex-1"><p className="truncate font-medium">{user.fullName}</p><p className="truncate text-sm text-muted-foreground">{user.email}</p></div><button type="button" onClick={start} disabled={starting} className="shrink-0 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{starting ? text.starting : text.start}</button></div> : null}<button type="button" onClick={onClose} className="mt-5 w-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{text.cancel}</button></div></div>;
}
