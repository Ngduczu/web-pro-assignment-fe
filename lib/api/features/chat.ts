import type { ApiTransport } from "@/lib/api/transport";
import type { ChatMessageDto, ChatPageQuery, ChatRoomDto, EditChatMessageRequest, SendChatMessageRequest } from "@/types/api";

function fileBody(file: File, content?: string | null, replyToMessageId?: string | null) {
  const form = new FormData();
  form.append("file", file);
  if (content) form.append("content", content);
  if (replyToMessageId) form.append("replyToMessageId", replyToMessageId);
  return form;
}

export function createChatApi(request: ApiTransport) {
  return {
    listRooms: () => request<ChatRoomDto[]>("/chat/rooms"),
    getOrCreateCourseRoom: (courseId: string) => request<ChatRoomDto>(`/chat/courses/${courseId}`, { method: "POST" }),
    getOrCreateDirectRoom: (userId: string) => request<ChatRoomDto>(`/chat/direct/${userId}`, { method: "POST" }),
    listMessages: (roomId: string, query?: ChatPageQuery) => request<ChatMessageDto[]>(`/chat/rooms/${roomId}/messages`, { query }),
    sendMessage: (roomId: string, body: SendChatMessageRequest) => request<ChatMessageDto>(`/chat/rooms/${roomId}/messages`, { method: "POST", body }),
    sendAttachment: (roomId: string, file: File, content?: string | null, replyToMessageId?: string | null) => request<ChatMessageDto>(`/chat/rooms/${roomId}/messages/attachment`, { method: "POST", body: fileBody(file, content, replyToMessageId) }),
    getAttachment: (messageId: string, attachmentId: string, download = false) => request<Blob>(`/chat/messages/${messageId}/attachments/${attachmentId}/content`, { query: { download } }),
    editMessage: (messageId: string, body: EditChatMessageRequest) => request<ChatMessageDto>(`/chat/messages/${messageId}`, { method: "PATCH", body }),
    removeMessage: (messageId: string) => request<void>(`/chat/messages/${messageId}`, { method: "DELETE" }),
    markAsRead: (roomId: string, messageId: string) => request<void>(`/chat/rooms/${roomId}/read/${messageId}`, { method: "POST" }),
  };
}

export type ChatApi = ReturnType<typeof createChatApi>;
