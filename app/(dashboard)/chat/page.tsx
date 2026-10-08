import { Suspense } from "react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

async function ChatContent() {
  await connection(); const { user } = await requireAuth();
  let rooms;
  let courses;
  try {
    [rooms, courses] = await Promise.all([serverApis.chat.listRooms(), user.role === "Student" ? serverApis.courses.listMine() : serverApis.courses.list({ teacherId: user.role === "Teacher" ? user.id : undefined, pageSize: 100 }).then((result) => result.items)]);
  } catch { return <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">Messages could not be loaded.</div>; }
  return <section className="space-y-6"><header><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Collaboration</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Messages</h1><p className="mt-2 text-muted-foreground">Course conversations, direct messages and shared files.</p></header><ChatWorkspace initialRooms={rooms} courses={courses} currentUserId={user.id} /></section>;
}

export default function ChatPage() { return <Suspense fallback={<DashboardSkeleton />}><ChatContent /></Suspense>; }
