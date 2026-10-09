"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { BookOpen, MessageCircle, Plus, UserRound } from "lucide-react";
import type { ChatRoomDto, CourseDto } from "@/types/api";

type ConversationTab = "personal" | "groups";

export function roomLabel(
  room: ChatRoomDto,
  courses: CourseDto[],
  currentUserId: string,
  directLabels: Record<string, string> = {},
  language: "en" | "vi" = "en",
) {
  if (room.courseId) {
    return courses.find((course) => course.id === room.courseId)?.name ?? room.title ?? (language === "vi" ? "Trò chuyện khóa học" : "Course conversation");
  }
  if (room.directParticipantName) {
    return room.directParticipantName;
  }
  if (directLabels[room.id]) {
    return directLabels[room.id];
  }
  const other = room.participantIds.find((id) => id !== currentUserId);
  return other ? `Direct · ${other.slice(0, 8)}` : (language === "vi" ? "Trò chuyện trực tiếp" : "Direct conversation");
}

type ChatRoomListProps = {
  rooms: ChatRoomDto[];
  courses: CourseDto[];
  currentUserId: string;
  directLabels?: Record<string, string>;
  selectedId?: string;
  onSelect: (room: ChatRoomDto) => void;
  onCreateCourse: (courseId: string) => void;
  onOpenDirect: () => void;
};

export function ChatRoomList({
  rooms,
  courses,
  currentUserId,
  directLabels = {},
  selectedId,
  onSelect,
  onCreateCourse,
  onOpenDirect,
}: ChatRoomListProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const selectedRoom = rooms.find((room) => room.id === selectedId);
  const [activeTab, setActiveTab] = useState<ConversationTab>(selectedRoom?.courseId ? "groups" : "personal");
  const personalTabRef = useRef<HTMLButtonElement>(null);
  const groupsTabRef = useRef<HTMLButtonElement>(null);
  const personalRooms = rooms.filter((room) => !room.courseId);
  const groupRooms = rooms.filter((room) => Boolean(room.courseId));
  const visibleRooms = activeTab === "personal" ? personalRooms : groupRooms;
  const roomCourseIds = new Set(rooms.flatMap((room) => (room.courseId ? [room.courseId] : [])));
  const missingCourses = courses.filter((course) => !roomCourseIds.has(course.id));

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: ConversationTab) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextTab = event.key === "Home" ? "personal"
      : event.key === "End" ? "groups"
        : tab === "personal" ? "groups" : "personal";
    setActiveTab(nextTab);
    (nextTab === "personal" ? personalTabRef : groupsTabRef).current?.focus();
  }

  function latestTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();
    return new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short" }).format(date);
  }

  return (
    <aside className="flex h-full min-h-0 flex-col bg-card">
      {/* Header */}
      <div className="border-b border-border/70 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">{isVi ? "Tin nhắn" : "Messages"}</h2>
            <p className="text-xs text-muted-foreground">{visibleRooms.length} {isVi ? "cuộc trò chuyện" : `conversation${visibleRooms.length === 1 ? "" : "s"}`}</p>
          </div>
          {activeTab === "personal" ? (
            <button
              type="button"
              onClick={onOpenDirect}
              className="flex size-9 items-center justify-center rounded-lg border border-border bg-background shadow-xs transition hover:bg-muted"
              title={isVi ? "Bắt đầu trò chuyện cá nhân" : "Start a personal conversation"}
              aria-label={isVi ? "Tin nhắn cá nhân mới" : "New personal message"}
            >
              <Plus className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1" role="tablist" aria-orientation="horizontal" aria-label={isVi ? "Loại tin nhắn" : "Message type"}>
          <button
            ref={personalTabRef}
            id="chat-tab-personal"
            type="button"
            role="tab"
            aria-selected={activeTab === "personal"}
            aria-controls="chat-tab-panel"
            tabIndex={activeTab === "personal" ? 0 : -1}
            onClick={() => setActiveTab("personal")}
            onKeyDown={(event) => handleTabKeyDown(event, "personal")}
            className={`flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-center text-xs font-medium transition ${activeTab === "personal" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="truncate">{isVi ? "Cá nhân" : "Personal"}</span><span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{personalRooms.length}</span>
          </button>
          <button
            ref={groupsTabRef}
            id="chat-tab-groups"
            type="button"
            role="tab"
            aria-selected={activeTab === "groups"}
            aria-controls="chat-tab-panel"
            tabIndex={activeTab === "groups" ? 0 : -1}
            onClick={() => setActiveTab("groups")}
            onKeyDown={(event) => handleTabKeyDown(event, "groups")}
            className={`flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-center text-xs font-medium transition ${activeTab === "groups" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="truncate">{isVi ? "Nhóm" : "Groups"}</span><span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{groupRooms.length}</span>
          </button>
        </div>

        {activeTab === "groups" && missingCourses.length ? (
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) onCreateCourse(event.target.value);
              event.target.value = "";
            }}
            className="mt-3.5 h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none transition focus:border-primary/60"
          >
            <option value="">{isVi ? "+ Bắt đầu trò chuyện khóa học" : "+ Start a course conversation"}</option>
            {missingCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {/* Room list */}
      <div id="chat-tab-panel" role="tabpanel" aria-labelledby={activeTab === "personal" ? "chat-tab-personal" : "chat-tab-groups"} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5">
        {visibleRooms.length ? (
          visibleRooms.map((room) => {
            const isSelected = selectedId === room.id;
            const isCourse = Boolean(room.courseId);
            const label = roomLabel(room, courses, currentUserId, directLabels, language);
            const initial = label.slice(0, 1).toUpperCase();
            const preview = room.latestMessage?.content?.trim()
              || (room.latestMessage?.hasAttachments ? (isVi ? "📎 Tệp đính kèm" : "📎 Attachment") : "");
            const previewWithSender = preview && room.latestMessage?.senderId === currentUserId
              ? `${isVi ? "Bạn: " : "You: "}${preview}`
              : preview;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelect(room)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  isSelected
                    ? "bg-primary/8 text-foreground ring-1 ring-primary/15"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                {/* Avatar / Icon */}
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl transition ${
                    isCourse
                      ? "bg-primary/10 text-primary"
                      : isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-foreground font-semibold border border-border"
                  }`}
                >
                  {isCourse ? (
                    <BookOpen className="size-4.5" />
                  ) : (
                    <span>{initial || <UserRound className="size-4" />}</span>
                  )}
                </span>

                {/* Information */}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{label}</span>
                    {room.latestMessage ? <span className="shrink-0 text-[10px] text-muted-foreground">{latestTime(room.latestMessage.createdAt)}</span> : null}
                  </span>
                  <span className={`mt-1 block truncate text-xs ${room.hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {room.archivedAt
                      ? (isVi ? "Đã lưu trữ" : "Archived")
                      : previewWithSender || (isCourse
                        ? (isVi ? "Trò chuyện khóa học" : "Course conversation")
                        : room.directParticipantEmail || (isVi ? "Trò chuyện trực tiếp" : "Direct conversation"))}
                  </span>
                </span>
                {room.hasUnread ? (
                  <span
                    className="size-2.5 shrink-0 rounded-full bg-destructive shadow-[0_0_0_3px] shadow-destructive/10"
                    title={isVi ? "Có tin nhắn mới" : "New messages"}
                  >
                    <span className="sr-only">{isVi ? "Có tin nhắn mới" : "New messages"}</span>
                  </span>
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="flex h-56 flex-col items-center justify-center p-5 text-center text-sm text-muted-foreground">
            <MessageCircle className="mb-3 size-8 opacity-40" />
            <p className="font-medium text-foreground">{activeTab === "personal" ? (isVi ? "Chưa có tin nhắn cá nhân" : "No personal messages yet") : (isVi ? "Chưa có tin nhắn nhóm" : "No group messages yet")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === "personal"
                ? (isVi ? "Bấm + để bắt đầu trò chuyện với một người." : "Click + to start a conversation with someone.")
                : (isVi ? "Chọn khóa học để bắt đầu trò chuyện cùng nhóm." : "Select a course to start chatting with a group.")}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
