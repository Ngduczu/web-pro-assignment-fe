"use client";

import { useState } from "react";
import { Mail, Search, UserRound, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ChatRoomDto, ChatUserSearchDto } from "@/types/api";

type SearchMode = "email" | "name";

const copy = {
  en: {
    title: "New direct message",
    description: "Find an active user by email address or name.",
    emailTab: "Email",
    nameTab: "Name",
    emailPlaceholder: "Email address",
    namePlaceholder: "Enter at least 2 characters",
    search: "Search",
    searching: "Searching...",
    noEmailUser: "No active user was found with this email.",
    noNameUsers: "No active users matched this name.",
    invalidName: "Enter at least 2 characters to search by name.",
    start: "Start conversation",
    starting: "Opening...",
    openError: "Unable to open this conversation.",
    cancel: "Cancel",
    results: "Search results",
  },
  vi: {
    title: "Tin nhắn trực tiếp mới",
    description: "Tìm tài khoản đang hoạt động bằng email hoặc tên.",
    emailTab: "Email",
    nameTab: "Tên",
    emailPlaceholder: "Địa chỉ email",
    namePlaceholder: "Nhập ít nhất 2 ký tự",
    search: "Tìm kiếm",
    searching: "Đang tìm...",
    noEmailUser: "Không tìm thấy tài khoản đang hoạt động với email này.",
    noNameUsers: "Không tìm thấy tài khoản đang hoạt động phù hợp với tên này.",
    invalidName: "Nhập ít nhất 2 ký tự để tìm theo tên.",
    start: "Bắt đầu trò chuyện",
    starting: "Đang mở...",
    openError: "Không thể mở cuộc trò chuyện này.",
    cancel: "Hủy",
    results: "Kết quả tìm kiếm",
  },
};

export function DirectMessageDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (room: ChatRoomDto, user: ChatUserSearchDto) => void;
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [mode, setMode] = useState<SearchMode>("email");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChatUserSearchDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingUserId, setStartingUserId] = useState<string>();
  const [error, setError] = useState<string>();

  function changeMode(nextMode: SearchMode) {
    setMode(nextMode);
    setQuery("");
    setResults([]);
    setError(undefined);
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (mode === "name" && value.length < 2) {
      setError(text.invalidName);
      setResults([]);
      return;
    }

    setSearching(true);
    setError(undefined);
    setResults([]);
    try {
      const users = mode === "email"
        ? [await clientApis.users.findForChat(value)]
        : await clientApis.users.searchForChatByName(value);
      setResults(users);
      if (users.length === 0) setError(text.noNameUsers);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.isNotFound
          ? text.noEmailUser
          : language === "en" && caught instanceof ApiError
            ? caught.detail
            : mode === "email" ? text.noEmailUser : text.noNameUsers,
      );
    } finally {
      setSearching(false);
    }
  }

  async function start(user: ChatUserSearchDto) {
    setStartingUserId(user.id);
    setError(undefined);
    try {
      onCreated(await clientApis.chat.getOrCreateDirectRoom(user.id), user);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.openError);
      setStartingUserId(undefined);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} aria-label={text.cancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="direct-message-title" className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div>
            <h2 id="direct-message-title" className="text-xl font-semibold">{text.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{text.description}</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={text.cancel}>
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1" role="tablist" aria-label={text.description}>
            {(["email", "name"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => changeMode(item)}
                className={`min-h-9 rounded-lg px-3 text-sm font-medium transition ${mode === item ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item === "email" ? text.emailTab : text.nameTab}
              </button>
            ))}
          </div>

          <form onSubmit={search} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="chat-user-query">{mode === "email" ? text.emailPlaceholder : text.namePlaceholder}</label>
            <div className="relative min-w-0 flex-1">
              {mode === "email" ? <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /> : <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />}
              <input
                key={mode}
                id="chat-user-query"
                required
                minLength={mode === "name" ? 2 : undefined}
                type={mode === "email" ? "email" : "search"}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === "email" ? text.emailPlaceholder : text.namePlaceholder}
                autoComplete={mode === "email" ? "email" : "off"}
                autoFocus
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button type="submit" disabled={searching || !query.trim()} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
              <Search className="size-4" />
              {searching ? text.searching : text.search}
            </button>
          </form>

          {error ? <p role="status" className="mt-4 rounded-xl border border-border bg-muted/35 p-3 text-sm text-muted-foreground">{error}</p> : null}

          {results.length ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{text.results}</p>
              <div className="space-y-2">
                {results.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 transition hover:border-primary/30 hover:bg-primary/5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UserRound className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button type="button" onClick={() => void start(user)} disabled={Boolean(startingUserId)} className="min-h-9 shrink-0 rounded-lg border border-primary/30 px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50">
                      {startingUserId === user.id ? text.starting : text.start}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="h-10 w-full rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-muted">{text.cancel}</button>
        </div>
      </div>
    </div>
  );
}
