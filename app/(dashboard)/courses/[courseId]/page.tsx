import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, EnrollmentDto, ExerciseDto, LessonDto } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";
import { CourseManagementPanel } from "@/components/courses/course-management-panel";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId } = await params;
  let course: CourseDto;
  let enrollment: EnrollmentDto | undefined;
  let lessons: LessonDto[];
  let exercises: ExerciseDto[];
  let managedEnrollments: EnrollmentDto[] = [];
  try {
    course = await serverApis.courses.get(courseId);
    [enrollment, lessons, exercises, managedEnrollments] = user.role === "Student"
      ? await Promise.all([
          serverApis.enrollments.listMine().then((items) => items.find((item) => item.courseId === courseId)),
          serverApis.lessons.list(courseId),
          serverApis.assignments.listExercises(courseId),
          Promise.resolve([] as EnrollmentDto[]),
        ])
      : await Promise.all([Promise.resolve(undefined as EnrollmentDto | undefined), serverApis.lessons.list(courseId), serverApis.assignments.listExercises(courseId), serverApis.enrollments.listByCourse(courseId, { pageSize: 100 }).then((result) => result.items)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">This course could not be loaded.</section>;
  }

  return (
    <section className="space-y-8">
      <Link href="/courses" className="text-sm font-medium text-primary hover:underline">Back to courses</Link>
      <header className="max-w-3xl space-y-3"><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-medium text-primary">{course.status}</span><span className="text-sm text-muted-foreground">Capacity {course.maxStudents}</span></div><h1 className="text-3xl font-semibold tracking-tight">{course.name}</h1><p className="leading-7 text-muted-foreground">{course.description || "No description provided."}</p><p className="text-sm text-muted-foreground">Updated {dateFormatter.format(new Date(course.modifiedAt))}</p></header>
      {user.role === "Student" ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} /> : <CourseManagementPanel course={course} enrollments={managedEnrollments} />}
      <div className="space-y-4"><div><h2 className="text-lg font-semibold">Lessons</h2><p className="mt-1 text-sm text-muted-foreground">Published course content available to your account.</p></div>{!lessons.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">No lessons are available yet.</div> : <div className="divide-y divide-border border-y border-border">{lessons.map((lesson) => <Link key={lesson.id} href={`/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-muted/40"><span className="font-medium">{lesson.order}. {lesson.name}</span><span className="text-sm text-muted-foreground">{lesson.status}</span></Link>)}</div>}</div>
      <div className="space-y-4"><div><h2 className="text-lg font-semibold">Exercises</h2><p className="mt-1 text-sm text-muted-foreground">Assignments and submission deadlines for this course.</p></div>{!exercises.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">No exercises are available yet.</div> : <div className="divide-y divide-border border-y border-border">{exercises.map((exercise) => <Link key={exercise.id} href={`/courses/${course.id}/exercises/${exercise.id}`} className="flex flex-col gap-1 py-4 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><span className="font-medium">{exercise.title}</span><p className="text-sm text-muted-foreground">{exercise.description || "No description provided."}</p></div><span className="shrink-0 text-sm text-muted-foreground">{exercise.status}{exercise.dueAt ? ` · Due ${dateFormatter.format(new Date(exercise.dueAt))}` : ""}</span></Link>)}</div>}</div>
    </section>
  );
}