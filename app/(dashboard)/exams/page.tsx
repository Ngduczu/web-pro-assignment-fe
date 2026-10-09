import { Suspense } from "react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { ExaminationsWorkspace } from "@/components/examinations/examinations-workspace";
import type { CourseDto, QuestionBankDto } from "@/types/api";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { AlertBanner, PageHeader } from "@/components/ui/page-chrome";

async function ExamsContent() {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);

  let courses;
  let settled;
  let banks: QuestionBankDto[];

  try {
    courses =
      user.role === "Student"
        ? await serverApis.courses.listMine()
        : (await serverApis.courses.list({ teacherId: user.role === "Teacher" ? user.id : undefined, pageSize: 100 })).items;
    settled = await Promise.allSettled(
      courses.map(async (course) => ({
        course,
        examinations:
          user.role === "Student"
            ? await serverApis.examinations.listAvailable(course.id)
            : await serverApis.examinations.listByCourse(course.id),
      })),
    );
    banks = user.role === "Student" ? [] : await serverApis.questions.listBanks(user.role === "Teacher" ? user.id : undefined);
  } catch {
    return <AlertBanner>{text("Examinations could not be loaded.")}</AlertBanner>;
  }

  const items = settled.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.examinations.map((examination) => ({ course: result.value.course, examination }))
      : [],
  );

  return (
    <section className="space-y-8">
      <PageHeader
        title={text("Examinations")}
        description={
          user.role === "Student"
            ? text("Review your schedule, enter active examinations and revisit released results.")
            : text("Create, schedule and control examinations across your courses.")
        }
      />
      {settled.some((result) => result.status === "rejected") ? (
        <AlertBanner tone="warning">{text("Some course examinations could not be loaded.")}</AlertBanner>
      ) : null}
      <ExaminationsWorkspace initialItems={items} courses={courses as CourseDto[]} banks={banks} role={user.role} />
    </section>
  );
}

export const instant = false;

export default function ExamsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ExamsContent />
    </Suspense>
  );
}
