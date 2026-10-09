import { Suspense } from "react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { getServerLanguage } from "@/lib/i18n-server";

async function ChatContent({ searchParams }: { searchParams: Promise<{ courseId?: string; roomId?: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  const { courseId, roomId } = await searchParams;
  let rooms;
  let courses;
  try {
    [rooms, courses] = await Promise.all([
      serverApis.chat.listRooms(),
      user.role === "Student"
        ? serverApis.courses.listMine()
        : serverApis.courses.list({ teacherId: user.role === "Teacher" ? user.id : undefined, pageSize: 100 }).then((result) => result.items),
    ]);
  } catch {
    return <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{language === "vi" ? "Không thể tải tin nhắn." : "Messages could not be loaded."}</div>;
  }
  return (
    <section className="space-y-6">
      <ChatWorkspace
        initialRooms={rooms}
        courses={courses}
        currentUserId={user.id}
        initialCourseId={courseId}
        initialRoomId={roomId}
      />
    </section>
  );
}

export const instant = false;

export default function ChatPage({ searchParams }: { searchParams: Promise<{ courseId?: string; roomId?: string }> }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ChatContent searchParams={searchParams} />
    </Suspense>
  );
}
