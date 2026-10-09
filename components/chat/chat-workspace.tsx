"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import type { ChatMessageDto, ChatRoomDto, ChatUserSearchDto, CourseDto } from "@/types/api";
import { ChatRoomList, roomLabel } from "@/components/chat/chat-room-list";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { DirectMessageDialog } from "@/components/chat/direct-message-dialog";
import { useLanguage } from "@/lib/i18n";
import { HubConnectionState, type HubConnection } from "@microsoft/signalr";
import { createChatHubConnection } from "@/lib/api/chat-realtime";

type RealtimeStatus = "connecting" | "connected" | "disconnected";

function sortRoomsByActivity(rooms: ChatRoomDto[]) {
  return [...rooms].sort((a, b) => {
    const aActivity = Date.parse(a.latestMessage?.createdAt ?? a.createdAt) || 0;
    const bActivity = Date.parse(b.latestMessage?.createdAt ?? b.createdAt) || 0;
    return bActivity - aActivity || Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function ChatWorkspace({
  initialRooms,
  courses,
  currentUserId,
  initialCourseId,
  initialRoomId,
}: {
  initialRooms: ChatRoomDto[];
  courses: CourseDto[];
  currentUserId: string;
  initialCourseId?: string;
  initialRoomId?: string;
}) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const languageRef = useRef(language);
  languageRef.current = language;
  const initialSelected = initialRoomId
    ? initialRooms.find((r) => r.id === initialRoomId)
    : initialCourseId
      ? initialRooms.find((r) => r.courseId === initialCourseId)
      : undefined;
  const [rooms, setRooms] = useState(initialRooms);
  const roomsRef = useRef(initialRooms);
  roomsRef.current = rooms;
  const [selected, setSelected] = useState<ChatRoomDto | undefined>(initialSelected);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]), [text, setText] = useState(""), [reply, setReply] = useState<ChatMessageDto>();
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(Boolean(initialSelected)), [error, setError] = useState<string>();
  const [directModal, setDirectModal] = useState(false);
  const [directLabels, setDirectLabels] = useState<Record<string, string>>({});
  const activeRoomId = useRef(initialSelected?.id);
  const selectedRoomRef = useRef<ChatRoomDto | undefined>(initialSelected);
  const connectionRef = useRef<HubConnection | undefined>(undefined);
  const joinedRoomIdsRef = useRef(new Set<string>());
  const joiningRoomIdsRef = useRef(new Set<string>());
  const markedReadRef = useRef(new Set<string>());
  const messageLoadsRef = useRef(new Map<string, Promise<ChatMessageDto[]>>());
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("connecting");

  function listMessages(roomId: string) {
    const pending = messageLoadsRef.current.get(roomId);
    if (pending) return pending;

    const request = clientApis.chat
      .listMessages(roomId, { page: 1, pageSize: 100 })
      .finally(() => messageLoadsRef.current.delete(roomId));
    messageLoadsRef.current.set(roomId, request);
    return request;
  }

  function promoteRoomForMessage(message: ChatMessageDto, hasUnread = false) {
    const room = roomsRef.current.find((item) => item.id === message.chatRoomId)
      ?? (selectedRoomRef.current?.id === message.chatRoomId ? selectedRoomRef.current : undefined);
    if (!room) return;

    const updated: ChatRoomDto = {
      ...room,
      hasUnread: hasUnread ? true : room.hasUnread,
      latestMessage: {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
        hasAttachments: message.attachments.length > 0,
      },
    };
    const ordered = sortRoomsByActivity([
      updated,
      ...roomsRef.current.filter((item) => item.id !== updated.id),
    ]);
    roomsRef.current = ordered;
    setRooms(ordered);
    if (selectedRoomRef.current?.id === updated.id) {
      selectedRoomRef.current = updated;
      setSelected(updated);
    }
  }

  function saveRoom(room: ChatRoomDto) {
    const existing = roomsRef.current.find((item) => item.id === room.id);
    const savedRoom = {
      ...room,
      hasUnread: room.hasUnread || existing?.hasUnread || false,
      latestMessage: room.latestMessage ?? existing?.latestMessage ?? null,
    };
    const ordered = sortRoomsByActivity([
      savedRoom,
      ...roomsRef.current.filter((item) => item.id !== savedRoom.id),
    ]);
    roomsRef.current = ordered;
    setRooms(ordered);
  }

  async function markAsRead(roomId: string, messageId: string) {
    const key = `${roomId}:${messageId}`;
    if (markedReadRef.current.has(key)) return;

    markedReadRef.current.add(key);
    try {
      await clientApis.chat.markAsRead(roomId, messageId);
      const updatedRooms = roomsRef.current.map((room) => room.id === roomId ? { ...room, hasUnread: false } : room);
      roomsRef.current = updatedRooms;
      setRooms(updatedRooms);
      setSelected((room) => {
        if (room?.id !== roomId) return room;
        const updated = { ...room, hasUnread: false };
        selectedRoomRef.current = updated;
        return updated;
      });
    } catch (caught) {
      markedReadRef.current.delete(key);
      throw caught;
    }
  }

  async function load(room: ChatRoomDto, quiet = false) {
    if (!quiet) setLoading(true);
    try {
      const data = await listMessages(room.id);
      if (activeRoomId.current !== room.id) return;
      setMessages(data);
      const newest = data[0];
      if (newest) await markAsRead(room.id, newest.id).catch(() => undefined);
    } catch (caught) {
      if (!quiet && activeRoomId.current === room.id) {
        setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể tải tin nhắn." : "Unable to load messages."));
      }
    } finally {
      if (!quiet && activeRoomId.current === room.id) setLoading(false);
    }
  }
  function select(room: ChatRoomDto) {
    const updated = room.courseId && !room.participantIds.includes(currentUserId)
      ? { ...room, participantIds: [...room.participantIds, currentUserId] }
      : room;
    activeRoomId.current = updated.id;
    selectedRoomRef.current = updated;
    setSelected(updated);
    setReply(undefined);
    setError(undefined);
    void load(updated);
    void joinRealtimeRoom(updated).catch((caught) => {
      setError(languageRef.current === "en" && caught instanceof Error ? caught.message : (languageRef.current === "vi" ? "Không thể tham gia phòng chat." : "Unable to join chat room."));
    });
  }

  async function joinRealtimeRoom(room?: ChatRoomDto) {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected || !room || room.archivedAt) return;
    if (joinedRoomIdsRef.current.has(room.id) || joiningRoomIdsRef.current.has(room.id)) return;
    joiningRoomIdsRef.current.add(room.id);
    // The messages endpoint can lazily add a course participant. Wait for an
    // in-flight load so the hub join does not try to insert the same participant.
    try {
      await messageLoadsRef.current.get(room.id)?.catch(() => undefined);
      if (connection.state !== HubConnectionState.Connected) return;
      await connection.invoke("JoinRoom", room.id);
      joinedRoomIdsRef.current.add(room.id);
    } finally {
      joiningRoomIdsRef.current.delete(room.id);
    }
  }

  async function joinAllRealtimeRooms() {
    for (const room of roomsRef.current) {
      await joinRealtimeRoom(room);
    }
  }

  function closeSelectedRoom() {
    activeRoomId.current = undefined;
    selectedRoomRef.current = undefined;
    setSelected(undefined);
    setReply(undefined);
  }
  useEffect(() => {
    if (initialSelected) {
      void listMessages(initialSelected.id)
        .then((data) => {
          if (activeRoomId.current !== initialSelected.id) return;
          setMessages(data);
          const newest = data[0];
          if (newest) void markAsRead(initialSelected.id, newest.id).catch(() => undefined);
        })
        .catch((caught) => {
          if (activeRoomId.current === initialSelected.id) {
            setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể tải tin nhắn." : "Unable to load messages."));
          }
        })
        .finally(() => {
          if (activeRoomId.current === initialSelected.id) setLoading(false);
        });
    } else if (initialRoomId) {
      clientApis.chat.joinRoom(initialRoomId).then((room) => {
        saveRoom(room);
        select(roomsRef.current.find((item) => item.id === room.id) ?? room);
      }).catch(() => undefined);
    } else if (initialCourseId) {
      clientApis.chat.getOrCreateCourseRoom(initialCourseId).then((room) => {
        saveRoom(room);
        select(roomsRef.current.find((item) => item.id === room.id) ?? room);
      }).catch((caught) => {
        setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể mở trò chuyện khóa học." : "Unable to open course chat."));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let disposed = false;
    let connection: HubConnection | undefined;
    let restartTimer: number | undefined;
    const joinedRoomIds = joinedRoomIdsRef.current;
    const joiningRoomIds = joiningRoomIdsRef.current;

    async function synchronizeSelectedRoom() {
      await joinAllRealtimeRooms();
      const room = selectedRoomRef.current;
      if (!room) return;
      await joinRealtimeRoom(room);
      const data = await listMessages(room.id);
      if (activeRoomId.current !== room.id) return;
      setMessages(data);
      const newest = data[0];
      if (newest) await markAsRead(room.id, newest.id).catch(() => undefined);
    }

    async function start() {
      while (!disposed) {
        try {
          setRealtimeStatus("connecting");
          connection = await createChatHubConnection();
          let established = false;
          if (disposed) {
            await connection.stop();
            return;
          }

          connection.on("MessageReceived", (message: ChatMessageDto) => {
            promoteRoomForMessage(message, message.senderId !== currentUserId && message.chatRoomId !== activeRoomId.current);
            if (message.chatRoomId !== activeRoomId.current) {
              return;
            }
            setMessages((old) => [message, ...old.filter((item) => item.id !== message.id)]);
            void markAsRead(message.chatRoomId, message.id).catch(() => undefined);
          });
          connection.on("MessageUpdated", (message: ChatMessageDto) => {
            if (message.chatRoomId !== activeRoomId.current) return;
            setMessages((old) => old.map((item) => item.id === message.id ? message : item));
            if (roomsRef.current.find((room) => room.id === message.chatRoomId)?.latestMessage?.id === message.id) {
              promoteRoomForMessage(message);
            }
          });
          connection.on("MessageDeleted", (messageId: string) => {
            setMessages((old) => old.filter((item) => item.id !== messageId));
          });
          connection.onreconnecting(() => {
            joinedRoomIdsRef.current.clear();
            joiningRoomIdsRef.current.clear();
            setRealtimeStatus("connecting");
          });
          connection.onreconnected(() => {
            setRealtimeStatus("connected");
            void synchronizeSelectedRoom().catch(() => undefined);
          });
          connection.onclose(() => {
            joinedRoomIdsRef.current.clear();
            joiningRoomIdsRef.current.clear();
            if (!disposed) {
              connectionRef.current = undefined;
              setRealtimeStatus("disconnected");
              if (established) {
                restartTimer = window.setTimeout(() => void start(), 1_000);
              }
            }
          });

          connectionRef.current = connection;
          await connection.start();
          if (disposed) {
            await connection.stop();
            return;
          }
          established = true;
          setRealtimeStatus("connected");
          await synchronizeSelectedRoom().catch((caught) => {
            setError(languageRef.current === "en" && caught instanceof Error ? caught.message : (languageRef.current === "vi" ? "Không thể đồng bộ phòng chat." : "Unable to synchronize chat room."));
          });
          return;
        } catch {
          connectionRef.current = undefined;
          setRealtimeStatus("disconnected");
          await connection?.stop().catch(() => undefined);
          if (!disposed) await new Promise((resolve) => window.setTimeout(resolve, 3_000));
        }
      }
    }

    void start();
    return () => {
      disposed = true;
      if (restartTimer !== undefined) window.clearTimeout(restartTimer);
      connectionRef.current = undefined;
      joinedRoomIds.clear();
      joiningRoomIds.clear();
      if (connection) void connection.stop();
    };
    // The SignalR connection intentionally lives for the lifetime of this workspace.
    // Mutable room/selection state is read through refs by the event handlers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function createCourse(courseId: string) { setBusy(true); try { const room = await clientApis.chat.getOrCreateCourseRoom(courseId); saveRoom(room); select(room); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể mở trò chuyện khóa học." : "Unable to open course chat.")); } finally { setBusy(false); } }
  function directCreated(room: ChatRoomDto, user: ChatUserSearchDto) {
    const enrichedRoom: ChatRoomDto = {
      ...room,
      directParticipantName: user.fullName,
      directParticipantEmail: user.email,
      title: user.fullName,
    };
    saveRoom(enrichedRoom);
    setDirectLabels((old) => ({ ...old, [room.id]: user.fullName }));
    setDirectModal(false);
    select(enrichedRoom);
  }
  async function send() { if (!selected || !text.trim()) return; setBusy(true); setError(undefined); try { const message = await clientApis.chat.sendMessage(selected.id, { content: text.trim(), replyToMessageId: reply?.id ?? null }); setMessages((old) => [message, ...old.filter((item) => item.id !== message.id)]); promoteRoomForMessage(message); setText(""); setReply(undefined); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể gửi tin nhắn." : "Unable to send message.")); } finally { setBusy(false); } }
  async function file(fileValue: File) { if (!selected) return; setBusy(true); setError(undefined); try { const message = await clientApis.chat.sendAttachment(selected.id, fileValue, text.trim() || null, reply?.id ?? null); setMessages((old) => [message, ...old.filter((item) => item.id !== message.id)]); promoteRoomForMessage(message); setText(""); setReply(undefined); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể tải tệp đính kèm lên." : "Unable to upload attachment.")); } finally { setBusy(false); } }
  async function edit(message: ChatMessageDto) { const content = prompt(isVi ? "Chỉnh sửa tin nhắn" : "Edit message", message.content ?? ""); if (content === null || !content.trim()) return; try { const updated = await clientApis.chat.editMessage(message.id, { content: content.trim() }); setMessages((old) => old.map((item) => item.id === updated.id ? updated : item)); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể chỉnh sửa tin nhắn." : "Unable to edit message.")); } }
  async function remove(message: ChatMessageDto) { if (!confirm(isVi ? "Xóa tin nhắn này?" : "Delete this message?")) return; try { await clientApis.chat.removeMessage(message.id); setMessages((old) => old.filter((item) => item.id !== message.id)); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể xóa tin nhắn." : "Unable to delete message.")); } }
  async function download(messageId: string, attachmentId: string, fileName: string) { try { const blob = await clientApis.chat.getAttachment(messageId, attachmentId, true); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url); } catch (caught) { setError(languageRef.current === "en" && caught instanceof ApiError ? caught.detail : (languageRef.current === "vi" ? "Không thể tải tệp đính kèm xuống." : "Unable to download attachment.")); } }
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError(undefined)} className="rounded-md p-1 hover:bg-destructive/10" aria-label={isVi ? "Đóng thông báo lỗi" : "Dismiss error"}>
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className={selected ? "hidden lg:block" : "block"}>
          <ChatRoomList
            key={selected?.id ?? "no-selected-room"}
            rooms={rooms}
            courses={courses}
            currentUserId={currentUserId}
            directLabels={directLabels}
            selectedId={selected?.id}
            onSelect={select}
            onCreateCourse={createCourse}
            onOpenDirect={() => setDirectModal(true)}
          />
        </div>

        <section className={`${selected ? "flex" : "hidden lg:flex"} min-h-0 flex-col border-l border-border/70`}>
          {selected ? (
            <>
              <header className="flex h-18 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <button type="button" onClick={closeSelectedRoom} className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted lg:hidden" aria-label={isVi ? "Quay lại danh sách trò chuyện" : "Back to conversations"}>
                    <ArrowLeft className="size-5" />
                  </button>
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${selected.courseId ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"}`}>
                    {selected.courseId ? "C" : roomLabel(selected, courses, currentUserId, directLabels, language).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold sm:text-base">{roomLabel(selected, courses, currentUserId, directLabels, language)}</h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {selected.archivedAt
                        ? (isVi ? "Cuộc trò chuyện đã lưu trữ" : "Archived conversation")
                        : selected.courseId
                          ? (isVi ? "Trò chuyện khóa học" : "Course conversation")
                          : selected.directParticipantEmail || (isVi ? "Tin nhắn trực tiếp" : "Direct message")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full bg-muted/70 px-2.5 py-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
                  <span className={`size-2 rounded-full ${realtimeStatus === "connected" ? "bg-emerald-500" : realtimeStatus === "connecting" ? "animate-pulse bg-amber-500" : "bg-destructive"}`} />
                  <span className="hidden sm:inline">
                    {realtimeStatus === "connected" ? (isVi ? "Trực tuyến" : "Live") : realtimeStatus === "connecting" ? (isVi ? "Đang kết nối" : "Connecting") : (isVi ? "Mất kết nối" : "Offline")}
                  </span>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col bg-muted/15">
                {loading ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground" role="status">
                    {isVi ? "Đang tải tin nhắn…" : "Loading messages…"}
                  </div>
                ) : (
                  <ChatMessageList messages={messages} currentUserId={currentUserId} selectedRoom={selected} onReply={setReply} onEdit={edit} onDelete={remove} onDownload={download} />
                )}
                <ChatComposer value={text} onChange={setText} onSend={send} onFile={file} busy={busy} disabled={Boolean(selected.archivedAt)} reply={reply} onCancelReply={() => setReply(undefined)} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="size-7" />
              </div>
              <p className="mt-4 font-medium text-foreground">{isVi ? "Tin nhắn của bạn" : "Your messages"}</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">{isVi ? "Chọn một cuộc trò chuyện để xem tin nhắn và tiếp tục trao đổi." : "Select a conversation to view messages and continue chatting."}</p>
            </div>
          )}
        </section>
      </div>
      {directModal ? <DirectMessageDialog onClose={() => setDirectModal(false)} onCreated={directCreated} /> : null}
    </div>
  );
}
