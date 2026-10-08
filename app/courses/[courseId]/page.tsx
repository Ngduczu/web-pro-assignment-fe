import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { EnrollmentDto, LessonDto } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId } = await params;
  let course;
  let enrollment: EnrollmentDto | undefined;
  let lessons: LessonDto[];
  try {
    course = await serverApis.courses.get(courseId);
    [enrollment, lessons] = user.role === "Student"
      ? await Promise.all([
          serverApis.enrollments.listMine().then((items) => items.find((item) => item.courseId === courseId)),
          serverApis.lessons.list(courseId),
        ])
      : await Promise.all([Promise.resolve(undefined as EnrollmentDto | undefined), serverApis.lessons.list(courseId)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">This course could not be loaded.</section>;
  }

  return (
    <section className="space-y-8">
      <Link href="/courses" className="text-sm font-medium text-primary hover:underline">Back to courses</Link>
      <header className="max-w-3xl space-y-3"><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-medium text-primary">{course.status}</span><span className="text-sm text-muted-foreground">Capacity {course.maxStudents}</span></div><h1 className="text-3xl font-semibold tracking-tight">{course.name}</h1><p className="leading-7 text-muted-foreground">{course.description || "No description provided."}</p><p className="text-sm text-muted-foreground">Updated {dateFormatter.format(new Date(course.modifiedAt))}</p></header>
      {user.role === "Student" ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} /> : <button type="button" className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted" data-development-toast="Course management is in development.">Manage course</button>}
      <div className="space-y-4"><div><h2 className="text-lg font-semibold">Lessons</h2><p className="mt-1 text-sm text-muted-foreground">Published course content available to your account.</p></div>{!lessons.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">No lessons are available yet.</div> : <div className="divide-y divide-border border-y border-border">{lessons.map((lesson) => <Link key={lesson.id} href={`/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-muted/40"><span className="font-medium">{lesson.order}. {lesson.name}</span><span className="text-sm text-muted-foreground">{lesson.status}</span></Link>)}</div>}</div>
    </section>
  );
}