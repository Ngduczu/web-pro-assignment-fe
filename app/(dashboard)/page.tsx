import Link from "next/link";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, EnrollmentDto, ExaminationDto, ExerciseDto, Role, StudentExaminationDto, UserProfileDto } from "@/types/api";

type CourseActivity = { course: CourseDto; exercises: ExerciseDto[]; examinations: (ExaminationDto | StudentExaminationDto)[]; enrollments: EnrollmentDto[] };
type DashboardData = { courses: CourseDto[]; activities: CourseActivity[]; users?: UserProfileDto[]; pendingEnrollmentCount?: number; partialFailure?: boolean };

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string | null) { return value ? dateFormatter.format(new Date(value)) : "No date"; }
function isUpcoming(value: string | null) { return value ? new Date(value).getTime() >= Date.now() : false; }

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="space-y-4"><div><h2 className="text-lg font-semibold tracking-tight">{title}</h2>{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}</div>{children}</section>;
}

function EmptyState({ children }: { children: React.ReactNode }) { return <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">{children}</div>; }

function CourseList({ courses, action }: { courses: CourseDto[]; action?: string }) {
  if (!courses.length) return <EmptyState>No courses are available yet.</EmptyState>;
  return <div className="grid gap-3 md:grid-cols-2">{courses.slice(0, 6).map((course) => <div key={course.id} className="border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{course.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description || "No description provided."}</p></div><span className="shrink-0 text-xs text-muted-foreground">{course.status}</span></div>{action ? <Link className="mt-4 inline-block text-sm font-medium text-primary hover:underline" href={action}>Open courses</Link> : null}</div>)}</div>;
}

function AssignmentList({ items }: { items: { course: CourseDto; exercise: ExerciseDto }[] }) {
  if (!items.length) return <EmptyState>No upcoming assignments from the available course data.</EmptyState>;
  return <div className="divide-y divide-border border-y border-border">{items.slice(0, 5).map(({ course, exercise }) => <div key={exercise.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><p className="font-medium">{exercise.title}</p><p className="text-sm text-muted-foreground">{course.name}</p></div><p className="shrink-0 text-sm text-muted-foreground">Due {formatDate(exercise.dueAt)}</p></div>)}</div>;
}

function ExaminationList({ items }: { items: { course: CourseDto; examination: ExaminationDto | StudentExaminationDto }[] }) {
  if (!items.length) return <EmptyState>No upcoming examinations from the available course data.</EmptyState>;
  return <div className="divide-y divide-border border-y border-border">{items.slice(0, 5).map(({ course, examination }) => <div key={examination.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><p className="font-medium">{examination.title}</p><p className="text-sm text-muted-foreground">{course.name}</p></div><p className="shrink-0 text-sm text-muted-foreground">Starts {formatDate(examination.startAt)}</p></div>)}</div>;
}

function StatGrid({ stats }: { stats: { label: string; value: number | string }[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="border-b border-border pb-4"><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 text-2xl font-semibold">{stat.value}</p></div>)}</div>;
}

function QuickActions({ role }: { role: Role }) {
  const actions = role === "Student" ? [["Browse courses", "/courses"], ["View examinations", "/exams"]] : role === "Teacher" ? [["Manage courses", "/courses"], ["Manage examinations", "/exams"]] : [["Manage users", "/admin/users"], ["Review courses", "/courses"]];
  return <div className="flex flex-wrap gap-3">{actions.map(([label, href]) => <Link key={href} href={href} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{label}</Link>)}</div>;
}

async function loadDashboard(role: Role, userId: string): Promise<DashboardData> {
  if (role === "Admin") {
    const [users, courses] = await Promise.all([serverApis.users.list({ pageSize: 100 }), serverApis.courses.list({ pageSize: 100 })]);
    return { users: users.items, courses: courses.items, activities: [] };
  }

  let pendingEnrollmentCount = 0;
  let courses: CourseDto[];
  if (role === "Student") {
    const [studentCourses, studentEnrollments] = await Promise.all([serverApis.courses.listMine(), serverApis.enrollments.listMine()]);
    courses = studentCourses;
    pendingEnrollmentCount = studentEnrollments.filter((enrollment) => enrollment.status === "Waiting").length;
  } else {
    courses = (await serverApis.courses.list({ teacherId: userId, pageSize: 100 })).items;
  }
  const settled = await Promise.allSettled(courses.map(async (course): Promise<CourseActivity> => {
    const [exercises, examinations, enrollments] = role === "Student"
      ? await Promise.all([serverApis.assignments.listExercises(course.id), serverApis.examinations.listAvailable(course.id), Promise.resolve([] as EnrollmentDto[])])
      : await Promise.all([serverApis.assignments.listExercises(course.id), serverApis.examinations.listByCourse(course.id), serverApis.enrollments.listByCourse(course.id, { pageSize: 100 }).then((result) => result.items)]);
    return { course, exercises, examinations, enrollments };
  }));

  return { courses, activities: settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []), pendingEnrollmentCount, partialFailure: settled.some((result) => result.status === "rejected") };
}

function DashboardErrorState() { return <div className="border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">Dashboard data could not be loaded. Please try again later.</div>; }
function UnsupportedData() { return <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">Notifications and recent activity are not available because the backend does not currently expose those APIs.</div>; }

export default async function DashboardPage() {
  await connection();
  const { user } = await requireAuth();
  let data: DashboardData;
  try { data = await loadDashboard(user.role, user.id); } catch { return <DashboardErrorState />; }

  const assignments = data.activities.flatMap(({ course, exercises }) => exercises.filter((exercise) => exercise.status === "Published" && isUpcoming(exercise.dueAt)).map((exercise) => ({ course, exercise }))).sort((a, b) => new Date(a.exercise.dueAt || 0).getTime() - new Date(b.exercise.dueAt || 0).getTime());
  const examinations = data.activities.flatMap(({ course, examinations: exams }) => exams.filter((exam) => exam.status === "Published" && isUpcoming(exam.startAt)).map((examination) => ({ course, examination }))).sort((a, b) => new Date(a.examination.startAt).getTime() - new Date(b.examination.startAt).getTime());
  const pendingEnrollments = data.activities.reduce((total, activity) => total + activity.enrollments.filter((enrollment) => enrollment.status === "Waiting").length, 0);

  return <section className="space-y-10">
    <header className="max-w-2xl space-y-2"><p className="text-sm font-medium text-primary">{user.role} workspace</p><h1 className="text-3xl font-semibold tracking-tight">Welcome back, {user.fullName}.</h1><p className="text-muted-foreground">A focused view of the learning activity available to your account.</p></header>
    {data.partialFailure ? <div className="border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-700">Some course data could not be loaded. The sections below show the data that was available.</div> : null}
    {user.role === "Admin" ? <>
      <StatGrid stats={[{ label: "Users returned", value: data.users?.length || 0 }, { label: "Courses returned", value: data.courses.length }, { label: "Active users", value: data.users?.filter((item) => item.status === "Active").length || 0 }, { label: "Open courses", value: data.courses.filter((item) => item.status === "Open").length }]} />
      <Section title="Courses" description="Courses returned by the administration API."><CourseList courses={data.courses} action="/courses" /></Section>
      <Section title="Notifications and recent activity"><UnsupportedData /></Section>
    </> : <>
      <StatGrid stats={user.role === "Student" ? [{ label: "Enrolled courses", value: data.courses.length }, { label: "Upcoming assignments", value: assignments.length }, { label: "Upcoming examinations", value: examinations.length }, { label: "Pending enrollments", value: data.pendingEnrollmentCount || 0 }] : [{ label: "Managed courses", value: data.courses.length }, { label: "Upcoming assignments", value: assignments.length }, { label: "Upcoming examinations", value: examinations.length }, { label: "Pending enrollments", value: pendingEnrollments }]} />
      <Section title={user.role === "Student" ? "Courses you are taking" : "Courses you manage"}><CourseList courses={data.courses} action="/courses" /></Section>
      <div className="grid gap-10 lg:grid-cols-2"><Section title="Assignments due soon"><AssignmentList items={assignments} /></Section><Section title="Examinations coming up"><ExaminationList items={examinations} /></Section></div>
      <div className="grid gap-10 lg:grid-cols-2"><Section title="Quick actions"><QuickActions role={user.role} /></Section><Section title="Notifications and recent activity"><UnsupportedData /></Section></div>
    </>}
  </section>;
}
