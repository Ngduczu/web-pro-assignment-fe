import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight, BookOpen, UsersRound } from "lucide-react";
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
    <article className="group relative flex min-h-60 flex-col justify-between overflow-hidden border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
      <div className="space-y-4 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
          <span className={course.status === "Open" ? "shrink-0 border border-emerald-600/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700" : "shrink-0 border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"}>{course.status}</span>
        </div>
        <h2 className="line-clamp-2 text-xl font-semibold tracking-tight group-hover:text-primary">{course.name}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description || "No description provided."}</p>
      </div>
      <div className="mt-7 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5"><UsersRound className="size-3.5" /> Capacity {course.maxStudents}</p>
          <p>Updated {formatDate(course.modifiedAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View course <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
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
  const openCourses = data.courses.filter((course) => course.status === "Open").length;
  const pendingEnrollments = data.enrollments.filter((enrollment) => enrollment.status === "Waiting").length;
  return (
    <section className="space-y-10">
      <header className="relative overflow-hidden border-b border-border pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{user.role} workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Courses</h1><p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">A focused view of the learning spaces available to your account.</p></div>
          {user.role !== "Student" ? <button type="button" className="inline-flex h-10 items-center justify-center border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90" data-development-toast="Course creation is in development.">Create course</button> : null}
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-l-2 border-primary bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Visible courses</p><p className="mt-1 text-2xl font-semibold">{data.courses.length}</p></div>
        <div className="border-l-2 border-emerald-600 bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Open courses</p><p className="mt-1 text-2xl font-semibold">{openCourses}</p></div>
        <div className="border-l-2 border-amber-500 bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Pending requests</p><p className="mt-1 text-2xl font-semibold">{pendingEnrollments}</p></div>
      </div>
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-tight">{user.role === "Student" ? "Open courses" : "Your course spaces"}</h2><p className="mt-1 text-sm text-muted-foreground">{user.role === "Student" ? "Browse open courses and request to join." : "Courses currently assigned to your workspace."}</p></div></div>
      {!data.courses.length ? <EmptyState>No courses are available for your account yet.</EmptyState> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.courses.map((course) => <CourseCard key={course.id} course={course} enrollment={enrollmentsByCourse.get(course.id)} />)}</div>}
    </section>
  );
}