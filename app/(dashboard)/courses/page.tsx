import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUpRight, BookOpen, UsersRound } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, CourseStatus, EnrollmentDto, UserProfileDto } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";
import { CourseCreateForm } from "@/components/courses/course-create-form";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { getServerLanguage, translate } from "@/lib/i18n-server";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{children}</div>;
}

async function loadCourses(role: string, userId: string, search?: string, status?: CourseStatus) {
  if (role === "Student") {
    const [courses, enrollments] = await Promise.all([serverApis.courses.list({ search, status: "Open", pageSize: 100 }), serverApis.enrollments.listMine()]);
    return { courses: courses.items, enrollments };
  }

  const [courses, teachers] = await Promise.all([
    serverApis.courses.list({ search, status, teacherId: role === "Teacher" ? userId : undefined, pageSize: 100 }),
    role === "Admin" ? serverApis.users.list({ pageSize: 100 }).then((result) => result.items.filter((candidate) => candidate.role === "Teacher" && candidate.status === "Active")) : Promise.resolve([] as UserProfileDto[]),
  ]);
  return { courses: courses.items, enrollments: [] as EnrollmentDto[], teachers };
}

function CourseCard({ course, enrollment, language, canEnroll }: { course: CourseDto; enrollment?: EnrollmentDto; language: "en" | "vi"; canEnroll: boolean }) {
  return (
    <article className="group relative flex min-h-60 flex-col justify-between overflow-hidden border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
      <div className="space-y-4 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
          <span className={course.status === "Open" ? "shrink-0 border border-emerald-600/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700" : "shrink-0 border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"}>{course.status}</span>
        </div>
        <h2 className="line-clamp-2 text-xl font-semibold tracking-tight group-hover:text-primary">{course.name}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description || translate(language, "No description provided.")}</p>
      </div>
      <div className="mt-7 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5"><UsersRound className="size-3.5" /> {translate(language, "Capacity")} {course.maxStudents}</p>
          <p>{translate(language, "Updated")} {formatDate(course.modifiedAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{translate(language, "View course")} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
          {canEnroll ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} compact /> : null}
        </div>
      </div>
    </article>
  );
}

type CoursesPageProps = {
  searchParams: Promise<{ search?: string; status?: string }>;
};

async function CoursesContent({ searchParams }: CoursesPageProps) {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const query = await searchParams;
  const status = query.status === "Open" || query.status === "Closed" ? query.status : undefined;
  let data: { courses: CourseDto[]; enrollments: EnrollmentDto[]; teachers?: UserProfileDto[] };
  try {
    data = await loadCourses(user.role, user.id, query.search, status);
  } catch {
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{text("Courses could not be loaded. Please try again later.")}</section>;
  }

  const enrollmentsByCourse = new Map(data.enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  const openCourses = data.courses.filter((course) => course.status === "Open").length;
  const pendingEnrollments = data.enrollments.filter((enrollment) => enrollment.status === "Waiting").length;
  return (
    <section className="space-y-10">
      <header className="relative overflow-hidden border-b border-border pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{user.role} workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{text("Courses")}</h1><p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{text("A focused view of the learning spaces available to your account.")}</p></div>
          {user.role !== "Student" ? <CourseCreateForm role={user.role} teacherId={user.role === "Teacher" ? user.id : undefined} teachers={data.teachers ?? []} /> : null}
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-l-2 border-primary bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">{text("Visible courses")}</p><p className="mt-1 text-2xl font-semibold">{data.courses.length}</p></div>
        <div className="border-l-2 border-emerald-600 bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">{text("Open courses")}</p><p className="mt-1 text-2xl font-semibold">{openCourses}</p></div>
        <div className="border-l-2 border-amber-500 bg-muted/40 px-4 py-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">{text("Pending requests")}</p><p className="mt-1 text-2xl font-semibold">{pendingEnrollments}</p></div>
      </div>
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-tight">{user.role === "Student" ? text("Open courses") : text("Your course spaces")}</h2><p className="mt-1 text-sm text-muted-foreground">{user.role === "Student" ? text("Browse open courses and request to join.") : text("Courses currently assigned to your workspace.")}</p></div></div>
      {user.role !== "Student" ? <form className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row" method="get"><input name="search" defaultValue={query.search} placeholder={text("Search courses")} className="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm" /><select name="status" defaultValue={status ?? ""} className="h-10 border border-input bg-background px-3 text-sm"><option value="">{text("All statuses")}</option><option value="Open">{text("Open")}</option><option value="Closed">{text("Closed")}</option></select><button type="submit" className="h-10 border border-border px-4 text-sm font-medium hover:bg-muted">{text("Filter")}</button></form> : null}
      {!data.courses.length ? <EmptyState>{text("No courses are available for your account yet.")}</EmptyState> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.courses.map((course) => <CourseCard key={course.id} course={course} enrollment={enrollmentsByCourse.get(course.id)} language={language} canEnroll={user.role === "Student"} />)}</div>}
    </section>
  );
}

export default function CoursesPage(props: CoursesPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CoursesContent {...props} />
    </Suspense>
  );
}
