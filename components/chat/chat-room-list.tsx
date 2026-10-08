"use client";

import { BookOpen, MessageCircle, Plus, UsersRound } from "lucide-react";
import type { ChatRoomDto, CourseDto } from "@/types/api";

export function roomLabel(room: ChatRoomDto, courses: CourseDto[], currentUserId: string, directLabels: Record<string, string> = {}) {
  if (room.courseId) return courses.find((course) => course.id === room.courseId)?.name ?? "Course conversation";
  if (directLabels[room.id]) return directLabels[room.id];
  const other = room.participantIds.find((id) => id !== currentUserId);
  return other ? `Direct · ${other.slice(0, 8)}` : "Direct conversation";
}

export function ChatRoomList({ rooms, courses, currentUserId, directLabels, selectedId, onSelect, onCreateCourse, onOpenDirect }: { rooms: ChatRoomDto[]; courses: CourseDto[]; currentUserId: string; directLabels?: Record<string, string>; selectedId?: string; onSelect: (room: ChatRoomDto) => void; onCreateCourse: (courseId: string) => void; onOpenDirect: () => void }) {
  const roomCourseIds = new Set(rooms.flatMap((room) => room.courseId ? [room.courseId] : []));
  const missingCourses = courses.filter((course) => !roomCourseIds.has(course.id));
  return <aside className="flex h-full min-h-0 flex-col border border-border bg-card">
    <div className="border-b border-border p-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Conversations</h2><p className="text-xs text-muted-foreground">{rooms.length} rooms</p></div><button onClick={onOpenDirect} className="flex size-9 items-center justify-center border border-border hover:bg-muted" aria-label="New direct message"><Plus className="size-4" /></button></div>{missingCourses.length ? <select defaultValue="" onChange={(event) => { if (event.target.value) onCreateCourse(event.target.value); event.target.value = ""; }} className="mt-4 h-9 w-full border border-input bg-background px-2 text-xs"><option value="">Start a course conversation</option>{missingCourses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select> : null}</div>
    <div className="min-h-0 flex-1 overflow-y-auto p-2">{rooms.length ? rooms.map((room) => { const Icon = room.courseId ? BookOpen : UsersRound; return <button key={room.id} onClick={() => onSelect(room)} className={`mb-1 flex w-full items-center gap-3 p-3 text-left ${selectedId === room.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><span className="flex size-9 shrink-0 items-center justify-center bg-background"><Icon className="size-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium">{roomLabel(room, courses, currentUserId, directLabels)}</span><span className="mt-0.5 block text-xs text-muted-foreground">{room.archivedAt ? "Archived" : room.courseId ? "Course room" : "Direct message"}</span></span></button>; }) : <div className="flex h-48 flex-col items-center justify-center p-5 text-center text-sm text-muted-foreground"><MessageCircle className="mb-3 size-8 opacity-50" />No conversations yet.</div>}</div>
  </aside>;
}
