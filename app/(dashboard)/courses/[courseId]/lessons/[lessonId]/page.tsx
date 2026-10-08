import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { LessonMaterials } from "@/components/courses/lesson-materials";

export default async function LessonDetailPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId, lessonId } = await params;
  let course;
  let lesson;
  let materials;
  try {
    [course, lesson, materials] = await Promise.all([
      serverApis.courses.get(courseId),
      serverApis.lessons.get(lessonId),
      serverApis.lessons.listMaterials(lessonId),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">This lesson could not be loaded.</section>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm"><Link href={`/courses/${courseId}`} className="font-medium text-primary hover:underline">{course.name}</Link><span className="text-muted-foreground">/ Lesson</span></div>
      <header className="max-w-3xl space-y-3"><div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{lesson.status}</span><span>Order {lesson.order}</span></div><h1 className="text-3xl font-semibold tracking-tight">{lesson.name}</h1></header>
      <article className="max-w-3xl whitespace-pre-wrap border-y border-border py-6 leading-7 text-foreground">{lesson.content || "No lesson content provided."}</article>
      <LessonMaterials lessonId={lessonId} materials={materials} canManage={user.role === "Teacher" || user.role === "Admin"} />
    </section>
  );
}