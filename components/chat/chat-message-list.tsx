"use client";

import { useMemo } from "react";
import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  Pencil,
  Reply,
  Trash2,
} from "lucide-react";
import type { ChatAttachmentDto, ChatMessageDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

type ChatMessageListProps = {
  messages: ChatMessageDto[];
  currentUserId: string;
  selectedRoom?: import("@/types/api").ChatRoomDto;
  onReply: (message: ChatMessageDto) => void;
  onEdit: (message: ChatMessageDto) => void;
  onDelete: (message: ChatMessageDto) => void;
  onDownload: (messageId: string, attachmentId: string, fileName: string) => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(isoString: string) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "";
  }
}

function formatMessageTooltip(isoString: string, isVi: boolean) {
  try {
    return new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoString));
  } catch {
    return "";
  }
}

function formatDateSeparator(isoString: string, isVi: boolean) {
  try {
    const messageDate = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return isVi ? "Hôm nay" : "Today";
    }
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return isVi ? "Hôm qua" : "Yesterday";
    }
    return new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(messageDate);
  } catch {
    return "";
  }
}

function getAttachmentIcon(fileName: string, contentType: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (contentType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "")) {
    return FileImage;
  }
  if (contentType.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext || "")) {
    return FileAudio;
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
    return FileArchive;
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext || "")) {
    return FileText;
  }
  return File;
}

export function ChatMessageList({
  messages,
  currentUserId,
  selectedRoom,
  onReply,
  onEdit,
  onDelete,
  onDownload,
}: ChatMessageListProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  // Messages are received newest first from API, so reverse for chronological display.
  const ordered = useMemo(() => [...messages].reverse(), [messages]);
  const byId = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  return (
    <div className="chat-scrollbar flex min-h-0 flex-1 flex-col-reverse overflow-y-auto p-4 sm:p-6">
      <div>
        {ordered.length ? (
          ordered.map((message, index) => {
            const isMine = message.senderId === currentUserId;
            const reply = message.replyToMessageId ? byId.get(message.replyToMessageId) : undefined;
            const previous = index > 0 ? ordered[index - 1] : undefined;
            const next = ordered[index + 1];
            const messageDate = new Date(message.createdAt).toDateString();
            const previousDate = previous ? new Date(previous.createdAt).toDateString() : undefined;
            const nextDate = next ? new Date(next.createdAt).toDateString() : undefined;
            const gapBefore = previous ? Date.parse(message.createdAt) - Date.parse(previous.createdAt) : Number.POSITIVE_INFINITY;
            const gapAfter = next ? Date.parse(next.createdAt) - Date.parse(message.createdAt) : Number.POSITIVE_INFINITY;
            const showDate = !previous || previousDate !== messageDate;
            const groupedWithPrevious = Boolean(previous && previous.senderId === message.senderId && previousDate === messageDate && gapBefore < 5 * 60 * 1000);
            const groupedWithNext = Boolean(next && next.senderId === message.senderId && nextDate === messageDate && gapAfter < 5 * 60 * 1000);
            const showMessageTime = !previous || showDate || gapBefore >= 5 * 60 * 1000;
            const bubbleShape = isMine
              ? groupedWithPrevious && groupedWithNext
                ? "rounded-[1.25rem_0.5rem_0.5rem_1.25rem]"
                : groupedWithPrevious
                  ? "rounded-[1.25rem_0.5rem_1.25rem_1.25rem]"
                  : groupedWithNext
                    ? "rounded-[1.25rem_1.25rem_0.5rem_1.25rem]"
                    : "rounded-2xl"
              : groupedWithPrevious && groupedWithNext
                ? "rounded-[0.5rem_1.25rem_1.25rem_0.5rem]"
                : groupedWithPrevious
                  ? "rounded-[0.5rem_1.25rem_1.25rem_1.25rem]"
                  : groupedWithNext
                    ? "rounded-[1.25rem_1.25rem_1.25rem_0.5rem]"
                    : "rounded-2xl";
            const isDirectRoom = !selectedRoom?.courseId;
            const otherDisplayName = message.senderFullName
              || (isDirectRoom ? selectedRoom?.directParticipantName : undefined)
              || message.senderId.slice(0, 8);
            const replyDisplayName = reply
              ? reply.senderId === currentUserId
                ? (isVi ? "bạn" : "you")
                : reply.senderFullName
                  || (isDirectRoom ? selectedRoom?.directParticipantName : undefined)
                  || reply.senderId.slice(0, 8)
              : "";

            return (
              <div key={message.id} className={index === 0 ? "" : groupedWithPrevious ? "mt-0.5" : "mt-3"}>
                {showDate ? (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full border border-border/60 bg-muted/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      {formatDateSeparator(message.createdAt, isVi)}
                    </span>
                  </div>
                ) : null}
                {showMessageTime ? (
                  <div className="flex justify-center py-1 text-[11px] font-medium text-muted-foreground/80">
                    <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
                  </div>
                ) : null}

                <article className={`group flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine ? (
                    groupedWithNext ? (
                      <span className="size-7 shrink-0" aria-hidden="true" />
                    ) : (
                      <div title={otherDisplayName} className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-border/70">
                        {otherDisplayName.slice(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : null}

                  <div className={`flex min-w-0 flex-col ${reply ? "w-full" : "w-fit"} ${isMine ? "max-w-full items-end" : "max-w-[calc(100%-2rem)] items-start"} sm:max-w-[72%]`}>
                    {!isMine && !groupedWithPrevious ? (
                      <span className="mb-1 ml-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80">
                        <span>{otherDisplayName}</span>
                        {!isDirectRoom && message.senderRole === "Teacher" ? (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                            {isVi ? "Giáo viên" : "Teacher"}
                          </span>
                        ) : null}
                      </span>
                    ) : null}

                    {reply ? (
                      <>
                        <span className={`mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground ${isMine ? "self-end pr-1" : "self-start pl-1"}`}>
                          <Reply className="size-3.5" />
                          {isMine ? (isVi ? "Bạn đã trả lời" : "You replied to") : (isVi ? "Đã trả lời" : "Replied to")}
                          <span className="font-semibold text-foreground">{replyDisplayName}</span>
                        </span>
                        <blockquote className="mb-1 w-fit max-w-[min(85vw,28rem)] rounded-xl border-l-2 border-primary/40 bg-muted/60 px-2.5 py-1.5 text-[13px] leading-5 text-muted-foreground">
                          <p className="line-clamp-2 wrap-break-word">
                            {reply.content || reply.attachments[0]?.fileName || (isVi ? "Tệp đính kèm" : "Attachment")}
                          </p>
                        </blockquote>
                      </>
                    ) : null}

                    <div className={`relative flex w-fit max-w-full flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div
                        title={!showMessageTime ? formatMessageTooltip(message.createdAt, isVi) : undefined}
                        className={`w-fit max-w-full overflow-hidden px-3 py-2 text-[15px] leading-[1.35] shadow-xs ${bubbleShape} ${isMine ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15" : "border border-border/80 bg-card text-foreground shadow-xs"}`}
                      >
                        {message.content ? <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p> : null}

                        {message.attachments.length ? (
                          <div className={`${message.content ? "mt-2" : ""} space-y-1.5`}>
                            {message.attachments.map((attachment: ChatAttachmentDto) => {
                              const IconComponent = getAttachmentIcon(attachment.fileName, attachment.contentType);
                              return (
                                <button
                                  key={attachment.id}
                                  type="button"
                                  onClick={() => onDownload(message.id, attachment.id, attachment.fileName)}
                                  className={`flex w-full items-center gap-2.5 rounded-lg border p-2 text-left text-xs transition ${isMine ? "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" : "border-border bg-muted/50 text-foreground hover:bg-muted"}`}
                                >
                                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${isMine ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                                    <IconComponent className="size-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold">{attachment.fileName}</span>
                                    <span className="mt-0.5 block text-[10px] opacity-75">{formatFileSize(attachment.fileSize)}</span>
                                  </span>
                                  <Download className="size-4 shrink-0 opacity-75" />
                                </button>
                              );
                            })}
                          </div>
                        ) : null}

                        {message.editedAt ? (
                          <p className="mt-1 text-right text-[10px] italic opacity-75">{isVi ? "đã sửa" : "edited"}</p>
                        ) : null}
                      </div>

                      <div className={`mt-1 flex items-center gap-0 rounded-full border border-border bg-card px-0.5 py-0.5 shadow-sm transition-all duration-150 ${isMine ? "self-end sm:absolute sm:right-full sm:top-1/2 sm:mr-2 sm:-translate-y-1/2" : "self-start sm:absolute sm:left-full sm:top-1/2 sm:ml-2 sm:-translate-y-1/2"} opacity-100 sm:invisible sm:mt-0 sm:translate-x-1 sm:opacity-0 sm:group-hover:visible sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:visible sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100`}>
                        <button type="button" onClick={() => onReply(message)} className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" title={isVi ? "Trả lời" : "Reply"} aria-label={isVi ? "Trả lời" : "Reply"}>
                          <Reply className="size-3.5" />
                        </button>
                        {isMine ? (
                          <>
                            <button type="button" onClick={() => onEdit(message)} className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" title={isVi ? "Chỉnh sửa" : "Edit"} aria-label={isVi ? "Chỉnh sửa" : "Edit"}>
                              <Pencil className="size-3.5" />
                            </button>
                            <button type="button" onClick={() => onDelete(message)} className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" title={isVi ? "Xóa" : "Delete"} aria-label={isVi ? "Xóa" : "Delete"}>
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>

                {isMine && index === ordered.length - 1 ? (
                  <p className="mt-1 text-right text-[10px] font-medium text-muted-foreground">{isVi ? "Đã gửi" : "Sent"}</p>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
              <Reply className="size-6 text-muted-foreground/60" />
            </div>
            <p className="mt-4 font-semibold text-foreground">{isVi ? "Chưa có tin nhắn" : "No messages yet"}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {isVi ? "Gửi lời chào hoặc chia sẻ tài liệu để bắt đầu trao đổi." : "Send a greeting or share resources to start collaborating in this conversation."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
