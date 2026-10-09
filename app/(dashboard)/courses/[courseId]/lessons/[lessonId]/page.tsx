import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { LessonDetailWorkspace } from "@/components/courses/lesson-detail-workspace";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export const instant = false;

export default async function LessonDetailPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId, lessonId } = await params;
  const language = await getServerLanguage();
  let course;
  let lesson;
  let materials;
  let lessons;
  try {
    [course, lesson, materials, lessons] = await Promise.all([
      serverApis.courses.get(courseId),
      serverApis.lessons.get(lessonId),
      serverApis.lessons.listMaterials(lessonId),
      serverApis.lessons.list(courseId).catch(() => []),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{translate(language, "This lesson could not be loaded.")}</section>;
  }

  return (
    <section className="space-y-8">
      <LessonDetailWorkspace course={course} lesson={lesson} lessons={lessons} materials={materials} canManage={user.role === "Teacher" || user.role === "Admin"} />
    </section>
  );
}
