import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import type { CourseDto, QuestionBankDto, UserProfileDto } from "@/types/api";
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

export async function AdminHome() {
  await connection();
  const { user } = await requireRole("Admin");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const isVi = language === "vi";
  const dateFormatter = new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", { dateStyle: "medium" });

  let users: UserProfileDto[] = [];
  let courses: CourseDto[] = [];
  let banks: QuestionBankDto[] = [];

  try {
    const [usersResult, coursesResult, banksResult] = await Promise.all([
      serverApis.users.list({ pageSize: 100 }),
      serverApis.courses.list({ pageSize: 100 }),
      serverApis.questions.listBanks().catch(() => [] as QuestionBankDto[]),
    ]);
    users = usersResult.items;
    courses = coursesResult.items;
    banks = banksResult;
  } catch {
    return <AlertBanner>{text("Dashboard data could not be loaded. Please try again later.")}</AlertBanner>;
  }

  const studentCount = users.filter((u) => u.role === "Student").length;
  const teacherCount = users.filter((u) => u.role === "Teacher").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const activeUsersCount = users.filter((u) => u.status === "Active").length;
  const openCoursesCount = courses.filter((c) => c.status === "Open").length;
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={text("Administration")}
        title={`${text("Welcome back")}, ${user.fullName}`}
        description={text("Manage accounts, courses and question banks from one place.")}
        actions={
          <>
            <TextLink href="/admin" variant="primary">{text("Manage users")}</TextLink>
            <TextLink href="/courses">{text("Review courses")}</TextLink>
          </>
        }
      />

      <StatRow
        stats={[
          { label: text("Users returned"), value: users.length },
          { label: text("Active users"), value: activeUsersCount },
          { label: text("Open courses"), value: `${openCoursesCount} / ${courses.length}` },
          { label: text("Question banks"), value: banks.length },
        ]}
      />

      <div className="grid items-start gap-6 md:grid-cols-2">
        <PageSection title={isVi ? "Cơ cấu vai trò" : "Role distribution"}>
          <div className="divide-y divide-border rounded-xl border border-border px-4 text-sm">
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{text("Student")}</span>
              <span className="font-medium">{studentCount}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{text("Teacher")}</span>
              <span className="font-medium">{teacherCount}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{text("Admin")}</span>
              <span className="font-medium">{adminCount}</span>
            </div>
          </div>
        </PageSection>

        <PageSection title={isVi ? "Tình trạng tài khoản" : "Account status"}>
          <div className="divide-y divide-border rounded-xl border border-border px-4 text-sm">
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{text("Active")}</span>
              <span className="font-medium">{activeUsersCount}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{isVi ? "Hạn chế / Chưa kích hoạt" : "Restricted / Inactive"}</span>
              <span className="font-medium">{users.length - activeUsersCount}</span>
            </div>
          </div>
        </PageSection>
      </div>

      <PageSection
        title={isVi ? "Người dùng" : "User accounts"}
        description={isVi ? "Tài khoản trong kết quả quản trị hiện tại." : "Accounts returned in the current administration results."}
        action={<Link href="/admin" className="text-sm font-medium text-primary hover:underline">{text("Manage users")}</Link>}
      >
        {!users.length ? (
          <EmptyState>{isVi ? "Chưa có người dùng." : "No users yet."}</EmptyState>
        ) : (
          <DividedList>
            {users.slice(0, 8).map((u) => (
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
        )}
      </PageSection>

      <PageSection
        title={isVi ? "Khóa học" : "Courses"}
        description={isVi ? "Danh mục khóa học trong kết quả quản trị hiện tại." : "Courses returned in the current administration results."}
        action={<Link href="/courses" className="text-sm font-medium text-primary hover:underline">{text("Open courses")}</Link>}
      >
        {!courses.length ? (
          <EmptyState>{text("No courses are available yet.")}</EmptyState>
        ) : (
          <DividedList>
            {courses.slice(0, 8).map((course) => (
              <ListRow key={course.id} href={`/courses/${course.id}`}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{course.description || text("No description provided.")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {text("Course teacher")}: {userMap.get(course.teacherId) || course.teacherId}
                  </p>
                </div>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  {text(course.status)} · {text("Capacity")} {course.maxStudents}
                </span>
              </ListRow>
            ))}
          </DividedList>
        )}
      </PageSection>
    </div>
  );
}
