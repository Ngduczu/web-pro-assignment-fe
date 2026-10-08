import Link from "next/link";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, EnrollmentDto } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{children}</div>;
}

async function loadCourses(role: string, userId: string) {
  if (role === "Student") {
    const [courses, enrollments] = await Promise.all([serverApis.courses.list(), serverApis.enrollments.listMine()]);
    return { courses: courses.items, enrollments };
  }

  const courses = await serverApis.courses.list({ teacherId: role === "Teacher" ? userId : undefined, pageSize: 100 });
  return { courses: courses.items, enrollments: [] as EnrollmentDto[] };
}

function CourseCard({ course, enrollment }: { course: CourseDto; enrollment?: EnrollmentDto }) {
  return (
    <article className="flex min-h-52 flex-col justify-between border border-border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{course.name}</h2>
          <span className="shrink-0 text-xs text-muted-foreground">{course.status}</span>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description || "No description provided."}</p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <p>Capacity: {course.maxStudents}</p>
          <p>Updated {formatDate(course.modifiedAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/courses/${course.id}`} className="text-sm font-medium text-primary hover:underline">View course</Link>
          {enrollment ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} /> : null}
        </div>
      </div>
    </article>
  );
}

export default async function CoursesPage() {
  await connection();
  const { user } = await requireAuth();
  let data: { courses: CourseDto[]; enrollments: EnrollmentDto[] };
  try {
    data = await loadCourses(user.role, user.id);
  } catch {
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">Courses could not be loaded. Please try again later.</section>;
  }

  const enrollmentsByCourse = new Map(data.enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">{user.role} workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Courses</h1><p className="mt-2 text-muted-foreground">Browse the courses and access rules available to your account.</p></div>
        {user.role !== "Student" ? <button type="button" className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted" data-development-toast="Course creation is in development.">Create course</button> : null}
      </header>
      {!data.courses.length ? <EmptyState>No courses are available for your account yet.</EmptyState> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.courses.map((course) => <CourseCard key={course.id} course={course} enrollment={enrollmentsByCourse.get(course.id)} />)}</div>}
    </section>
  );
}