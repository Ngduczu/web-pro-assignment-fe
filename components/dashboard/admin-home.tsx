import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import type { CourseDto, UserProfileDto } from "@/types/api";
import {
  AlertBanner,
  DividedList,
  EmptyState,
  ListRow,
  PageHeader,
  PageSection,
  StatRow,
  TextLink,
} from "@/components/ui/page-chrome";
import { AreaRefreshButton } from "@/components/ui/area-refresh-button";

export async function AdminHome() {
  await connection();
  const { user } = await requireRole("Admin", "System");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const isVi = language === "vi";
  const dateFormatter = new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", { dateStyle: "medium" });

  let users: UserProfileDto[] = [];
  let courses: CourseDto[] = [];

  try {
    const [usersResult, coursesResult] = await Promise.all([
      serverApis.users.list({ pageSize: 20 }),
      serverApis.courses.list({ pageSize: 20 }),
    ]);
    users = usersResult.items;
    courses = coursesResult.items;
  } catch {
    return <AlertBanner>{text("Dashboard data could not be loaded. Please try again later.")}</AlertBanner>;
  }

  const activeUsersCount = users.filter((u) => u.status === "Active").length;
  const openCoursesCount = courses.filter((c) => c.status === "Open").length;
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={text("Administration")}
        title={`${text("Welcome back")}, ${user.fullName}`}
        description={text("Manage accounts, courses and question banks from one place.")}
        mascotSrc="/assets/owlie/point.webp"
        actions={<AreaRefreshButton label={isVi ? "Làm mới tổng quan" : "Refresh overview"} loadingLabel={isVi ? "Đang làm mới..." : "Refreshing..."} />}
      />

      <StatRow
        stats={[
          { label: text("Users returned"), value: users.length },
          { label: text("Active users"), value: activeUsersCount },
          { label: isVi ? "Khóa học đang mở" : "Active courses", value: openCoursesCount },
        ]}
      />

      <div className="grid items-start gap-6 md:grid-cols-2">
      <PageSection
        title={isVi ? "Quản lý người dùng" : "User management"}
        action={<TextLink href="/admin">{text("Manage users")}</TextLink>}
      >
        {!users.length ? (
          <EmptyState mascotSrc="/assets/owlie/think.webp">{isVi ? "Chưa có người dùng." : "No users yet."}</EmptyState>
        ) : (
          <div className="max-h-[calc(100vh-27rem)] min-h-64 overflow-y-auto pr-1">
          <DividedList>
            {users.map((u) => (
              <ListRow key={u.id}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{text(u.role)} · {text(u.status)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {text("Member since")} {dateFormatter.format(new Date(u.createdAt))}
                </span>
              </ListRow>
            ))}
          </DividedList>
          </div>
        )}
      </PageSection>

      <PageSection
        title={isVi ? "Quản lý khóa học" : "Course management"}
        action={<TextLink href="/courses">{text("Review courses")}</TextLink>}
      >
        {!courses.length ? (
          <EmptyState mascotSrc="/assets/owlie/peek.webp">{text("No courses are available yet.")}</EmptyState>
        ) : (
          <div className="max-h-[calc(100vh-27rem)] min-h-64 overflow-y-auto pr-1">
          <DividedList>
            {courses.map((course) => (
              <ListRow key={course.id} href={`/courses/${course.id}`}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{course.description || text("No description provided.")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {text("Course teacher")}: {userMap.get(course.teacherId) || course.teacherId}
                  </p>
                </div>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  {text(course.status)} · {text("Capacity")} {course.acceptedStudentCount}/{course.maxStudents}
                </span>
              </ListRow>
            ))}
          </DividedList>
          </div>
        )}
      </PageSection>
      </div>
    </div>
  );
}
