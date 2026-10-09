import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUpRight, BookOpen, CalendarDays, Search, Users } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, CourseStatus, EnrollmentDto, UserProfileDto } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";
import { CourseCreateForm } from "@/components/courses/course-create-form";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { AlertBanner, EmptyState, PageHeader, PageSection } from "@/components/ui/page-chrome";

function formatDate(value: string, language: "en" | "vi") {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium" }).format(new Date(value));
}

async function loadCourses(
  role: string,
  userId: string,
  tab: "all" | "available" | "waiting" | "mine",
  search?: string,
  status?: CourseStatus,
  includeDeleted = false,
) {
  if (role === "Student") {
    const [courseItems, enrollments] = await Promise.all([
      tab === "mine"
        ? serverApis.courses.listMine()
        : tab === "waiting"
          ? Promise.resolve([] as CourseDto[])
          : serverApis.courses.list({ search, status: "Open", pageSize: 100 }).then((result) => result.items),
      serverApis.enrollments.listMine(),
    ]);
    const normalizedSearch = search?.trim().toLocaleLowerCase();
    const activeCourseIds = new Set(
      enrollments
        .filter((enrollment) => enrollment.status === "Waiting" || enrollment.status === "Accepted")
        .map((enrollment) => enrollment.courseId),
    );
    const courses = courseItems.filter((course) => {
      return (tab !== "available" || !activeCourseIds.has(course.id)) &&
        (tab !== "mine" || !normalizedSearch || course.name.toLocaleLowerCase().includes(normalizedSearch));
    });
    const visibleEnrollments = tab === "waiting"
      ? enrollments.filter((enrollment) =>
          enrollment.status === "Waiting" &&
          (!normalizedSearch || enrollment.course?.name.toLocaleLowerCase().includes(normalizedSearch)),
        )
      : enrollments;
    return { courses, enrollments: visibleEnrollments };
  }

  const [courses, teachers] = await Promise.all([
    serverApis.courses.list({
      search,
      status,
      teacherId: role === "Teacher" && tab === "mine" ? userId : undefined,
      includeDeleted,
      pageSize: 100,
    }),
    role === "Admin"
      ? serverApis.users
          .list({ pageSize: 100 })
          .then((result) => result.items.filter((candidate) => candidate.role === "Teacher" && candidate.status === "Active"))
      : Promise.resolve([] as UserProfileDto[]),
  ]);
  return { courses: courses.items, enrollments: [] as EnrollmentDto[], teachers };
}

function WaitingEnrollmentCard({ enrollment, language }: { enrollment: EnrollmentDto; language: "en" | "vi" }) {
  const course = enrollment.course;
  return (
    <article className="flex min-h-40 flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <BookOpen className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              {language === "vi" ? "Đang chờ duyệt" : "Awaiting approval"}
            </span>
            {course ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.status === "Open" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {translate(language, course.status)}
              </span>
            ) : null}
          </div>
          <h2 className="truncate text-lg font-semibold leading-snug tracking-tight">
            {course?.status === "Open" ? (
              <Link href={`/courses/${course.id}`} className="transition-colors hover:text-primary">{course.name}</Link>
            ) : course?.name ?? (language === "vi" ? "Không xác định khóa học" : "Course unavailable")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "vi" ? "Gửi yêu cầu ngày" : "Requested"} {formatDate(enrollment.createdAt, language)}
          </p>
        </div>
      </div>
      <div className="shrink-0 sm:pl-4">
        <CourseEnrollmentAction
          courseId={enrollment.courseId}
          enrollment={enrollment}
          courseStatus={course?.status ?? "Closed"}
        />
      </div>
    </article>
  );
}

function CourseCard({
  course,
  enrollment,
  language,
  canEnroll,
}: {
  course: CourseDto;
  enrollment?: EnrollmentDto;
  language: "en" | "vi";
  canEnroll: boolean;
}) {
  const isOpen = course.status === "Open";
  return (
    <article className="group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {isOpen ? translate(language, "Open") : translate(language, "Closed")}
              </span>
              {course.deletedAt ? (
                <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                  {language === "vi" ? "Đã xóa" : "Deleted"}
                </span>
              ) : null}
            </div>
            <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
              {course.name}
            </h2>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">
          {course.description || translate(language, "No description provided.")}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4 shrink-0 text-primary/80" aria-hidden="true" />
            <span className="truncate">{translate(language, "Capacity")} <span className="font-semibold text-foreground">{course.maxStudents}</span></span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4 shrink-0 text-primary/80" aria-hidden="true" />
            <span className="truncate">{formatDate(course.modifiedAt, language)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/courses/${course.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {translate(language, "View course")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          {canEnroll && !course.deletedAt ? (
            <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} compact />
          ) : null}
        </div>
      </div>
    </article>
  );
}

type CoursesPageProps = {
  searchParams: Promise<{ tab?: string; search?: string; status?: string; includeDeleted?: string }>;
};

async function CoursesContent({ searchParams }: CoursesPageProps) {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const query = await searchParams;
  const tab = user.role === "Student"
    ? query.tab === "waiting" ? "waiting" : query.tab === "mine" ? "mine" : "available"
    : user.role === "Teacher" ? "mine" : "all";
  const status = query.status === "Open" || query.status === "Closed" ? query.status : undefined;
  const includeDeleted = query.includeDeleted === "true";
  let data: { courses: CourseDto[]; enrollments: EnrollmentDto[]; teachers?: UserProfileDto[] };

  try {
    data = await loadCourses(user.role, user.id, tab, query.search, status, includeDeleted);
  } catch {
    return <AlertBanner>{text("Courses could not be loaded. Please try again later.")}</AlertBanner>;
  }

  const enrollmentsByCourse = new Map(data.enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  return (
    <section className="space-y-10">
      <PageHeader
        title={text("Courses")}
        eyebrow={user.role === "Student" ? (language === "vi" ? "Không gian học tập" : "LEARNING SPACE") : user.role === "Teacher" ? (language === "vi" ? "Không gian giảng dạy" : "TEACHING WORKSPACE") : (language === "vi" ? "Quản trị đào tạo" : "COURSE ADMINISTRATION")}
        description={user.role === "Student"
          ? (language === "vi" ? "Khám phá khóa học và theo dõi hành trình học tập của bạn." : "Discover courses and keep track of your learning journey.")
          : user.role === "Teacher"
            ? (language === "vi" ? "Tổ chức các khóa học bạn phụ trách và quản lý nội dung giảng dạy." : "Organize your assigned courses and manage teaching content.")
            : (language === "vi" ? "Theo dõi danh mục khóa học và trạng thái vận hành trên hệ thống." : "Oversee the course catalog and its operational status.")}
        actions={
          user.role !== "Student" ? (
            <CourseCreateForm
              role={user.role}
              teacherId={user.role === "Teacher" ? user.id : undefined}
              teachers={data.teachers ?? []}
            />
          ) : undefined
        }
      />

      {user.role === "Student" ? (
        <nav aria-label={language === "vi" ? "Phân loại khóa học" : "Course views"} className="flex w-full max-w-full overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-xs sm:w-fit">
          {([
            ["available", language === "vi" ? "Khóa học khả dụng" : "Available courses"],
            ["waiting", language === "vi" ? "Hàng đợi" : "Pending"],
            ["mine", language === "vi" ? "Khóa học của tôi" : "My courses"],
          ] as const).map(([tabValue, label]) => (
            <Link
              key={tabValue}
              href={`/courses?tab=${tabValue}`}
              aria-current={tab === tabValue ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${tab === tabValue ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}

      <PageSection
        title={user.role === "Student"
          ? tab === "mine"
            ? (language === "vi" ? "Khóa học của tôi" : "My courses")
            : tab === "waiting"
              ? (language === "vi" ? "Khóa học đang chờ duyệt" : "Pending courses")
              : (language === "vi" ? "Khóa học khả dụng" : "Available courses")
          : tab === "mine"
            ? (language === "vi" ? "Khóa học của tôi" : "My courses")
            : (language === "vi" ? "Tất cả khóa học" : "All courses")}
        description={
          user.role === "Student"
            ? tab === "mine"
              ? (language === "vi" ? "Các khóa học bạn đã được duyệt tham gia." : "Courses where your enrollment has been accepted.")
              : tab === "waiting"
                ? (language === "vi" ? "Các khóa học đang chờ giáo viên chấp nhận yêu cầu đăng ký." : "Courses waiting for a teacher to approve your request.")
                : (language === "vi" ? "Các khóa học đang mở mà bạn chưa đăng ký hoặc chưa được duyệt." : "Open courses you have not joined or been approved for yet.")
            : tab === "mine"
                ? text("Courses currently assigned to your workspace.")
                : (language === "vi" ? "Toàn bộ khóa học đang có trên hệ thống." : "All courses currently available on the platform.")
        }
      >
        <form className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 shadow-xs sm:flex-row sm:items-center sm:p-4" method="get">
            <input type="hidden" name="tab" value={tab} />
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{text("Search courses")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                name="search"
                defaultValue={query.search}
                placeholder={text("Search courses")}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            {user.role !== "Student" ? <label className="sm:w-44"><span className="sr-only">{text("All statuses")}</span><select name="status" defaultValue={status ?? ""} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40">
              <option value="">{text("All statuses")}</option>
              <option value="Open">{text("Open")}</option>
              <option value="Closed">{text("Closed")}</option>
            </select></label> : null}
            {user.role === "Admin" ? <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
              <input type="checkbox" name="includeDeleted" value="true" defaultChecked={includeDeleted} />
              {language === "vi" ? "Xem cả khóa đã xóa" : "Include deleted"}
            </label> : null}
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              <Search className="size-4" aria-hidden="true" />
              {text("Filter")}
            </button>
          </form>

        {tab === "waiting" && user.role === "Student" ? (
          !data.enrollments.length ? (
            <EmptyState>{language === "vi" ? "Bạn chưa có khóa học nào đang chờ duyệt." : "You have no courses awaiting approval."}</EmptyState>
          ) : (
            <div className="space-y-3">
              {data.enrollments.map((enrollment) => (
                <WaitingEnrollmentCard key={enrollment.id} enrollment={enrollment} language={language} />
              ))}
            </div>
          )
        ) : !data.courses.length ? (
          <EmptyState>{text("No courses are available for your account yet.")}</EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {data.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollmentsByCourse.get(course.id)}
                language={language}
                canEnroll={user.role === "Student"}
              />
            ))}
          </div>
        )}
      </PageSection>
    </section>
  );
}

export const instant = false;

export default function CoursesPage(props: CoursesPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CoursesContent {...props} />
    </Suspense>
  );
}
