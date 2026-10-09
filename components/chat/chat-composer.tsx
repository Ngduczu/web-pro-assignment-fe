"use client";

import { useRef, useState } from "react";
import { Paperclip, Reply, Send, Smile, X } from "lucide-react";
import type { ChatMessageDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFile: (file: File) => void;
  busy: boolean;
  disabled: boolean;
  reply?: ChatMessageDto;
  onCancelReply: () => void;
};

export function ChatComposer({
  value,
  onChange,
  onSend,
  onFile,
  busy,
  disabled,
  reply,
  onCancelReply,
}: ChatComposerProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojis = ["😀", "😃", "😄", "😁", "😆", "😂", "🙂", "😊", "😍", "🥰", "😘", "😎", "🤔", "😅", "😭", "😮", "👍", "👎", "👏", "🙌", "🙏", "❤️", "💚", "🎉", "🔥", "✨", "💯", "✅", "👀", "🤝", "☕", "📚"];

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${emoji}${value.slice(end)}`);
    setEmojiOpen(false);
    textarea?.focus();
    requestAnimationFrame(() => textarea?.setSelectionRange(start + emoji.length, start + emoji.length));
  }

  return (
    <div
      className="border-t border-border/70 bg-card p-3 sm:p-4"
      onKeyDownCapture={(event) => {
        if (event.key === "Escape" && emojiOpen) setEmojiOpen(false);
      }}
    >
      {/* Replying Banner */}
      {reply ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs text-foreground shadow-xs animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Reply className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-primary">{isVi ? "Đang trả lời tin nhắn" : "Replying to message"}</span>
              <p className="line-clamp-1 text-muted-foreground">
                {reply.content || reply.attachments[0]?.fileName || (isVi ? "Tệp đính kèm" : "Attachment")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={isVi ? "Hủy trả lời" : "Cancel reply"}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {/* Input controls container */}
      <div className="flex items-end gap-2">
        {/* Attach File Button */}
        <label
          title={isVi ? "Đính kèm tệp" : "Attach file"}
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background transition ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs active:scale-95"
          }`}
        >
          <Paperclip className="size-4.5" />
          <input
            type="file"
            className="sr-only"
            disabled={disabled || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onFile(file);
            }}
          />
        </label>

        {/* Text Input Area */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-input bg-background transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={4000}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={disabled
              ? (isVi ? "Cuộc trò chuyện này đã được lưu trữ" : "This conversation is archived")
              : (isVi ? "Viết tin nhắn… (Enter để gửi, Shift+Enter để xuống dòng)" : "Write a message… (Enter to send, Shift+Enter for new line)")}
            className="max-h-36 min-h-10 w-full resize-none border-0 bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => setEmojiOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isVi ? "Mở bảng emoji" : "Open emoji picker"}
            aria-expanded={emojiOpen}
            aria-haspopup="dialog"
          >
            <Smile className="size-4.5" />
          </button>
          {emojiOpen && !disabled ? (
            <div
              role="dialog"
              aria-label={isVi ? "Chọn emoji" : "Choose an emoji"}
              onKeyDown={(event) => {
                if (event.key === "Escape") setEmojiOpen(false);
              }}
              className="absolute bottom-full right-0 z-30 mb-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-3 shadow-xl"
            >
              <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">{isVi ? "Emoji thường dùng" : "Frequently used"}</p>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="flex aspect-square items-center justify-center rounded-lg text-xl transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={isVi ? `Chèn ${emoji}` : `Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || busy || !value.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          aria-label={isVi ? "Gửi tin nhắn" : "Send message"}
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
