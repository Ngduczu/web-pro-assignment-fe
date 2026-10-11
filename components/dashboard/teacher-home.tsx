import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import type {
  CourseDto,
  ExerciseDto,
  PaginatedResponse,
  QuestionBankDto,
  SubmissionDto,
} from "@/types/api";
import { TeacherDashboardWorkTabs } from "@/components/teacher/teacher-dashboard-work-tabs";
import {
  AlertBanner,
  DividedList,
  EmptyState,
  ListRow,
  PageHeader,
  PageSection,
  TextLink,
} from "@/components/ui/page-chrome";

const PAGE_SIZE = 20;
const REQUEST_CONCURRENCY = 4;

async function listAllPages<T>(loadPage: (page: number) => Promise<PaginatedResponse<T>>) {
  const firstPage = await loadPage(1);
  const items = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await loadPage(page);
    items.push(...result.items);
  }

  return items;
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, map: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await map(items[index]);
      }
    }),
  );

  return results;
}

type ExerciseContext = { courseId: string; courseName: string; exercise: ExerciseDto };

export async function TeacherHome() {
  await connection();
  const { user } = await requireRole("Teacher");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const isVi = language === "vi";

  let courses: CourseDto[] = [];
  let banks: QuestionBankDto[] = [];

  try {
    const [coursesResult, banksResult] = await Promise.all([
      listAllPages((page) => serverApis.courses.list({ teacherId: user.id, page, pageSize: PAGE_SIZE })),
      serverApis.questions.listBanks(user.id),
    ]);
    courses = coursesResult;
    banks = banksResult;
  } catch {
    return <AlertBanner>{text("Dashboard data could not be loaded. Please try again later.")}</AlertBanner>;
  }

  const courseWork = await mapWithConcurrency(courses, REQUEST_CONCURRENCY, async (course) => {
    const [enrollmentResult, exerciseResult] = await Promise.allSettled([
      listAllPages((page) => serverApis.enrollments.listByCourse(course.id, { page, pageSize: PAGE_SIZE })),
      serverApis.assignments.listExercises(course.id),
    ]);

    return {
      course,
      enrollments: enrollmentResult.status === "fulfilled"
        ? enrollmentResult.value.filter((enrollment) => enrollment.status === "Waiting")
        : [],
      exercises: exerciseResult.status === "fulfilled" ? exerciseResult.value : [],
      enrollmentFailed: enrollmentResult.status === "rejected",
      exercisesFailed: exerciseResult.status === "rejected",
    };
  });

  const pendingEnrollments = courseWork
    .flatMap(({ course, enrollments }) => enrollments.map((enrollment) => ({
      courseId: course.id,
      courseName: course.name,
      enrollment,
    })))
    .sort((a, b) => Date.parse(b.enrollment.createdAt) - Date.parse(a.enrollment.createdAt));
  const exerciseContexts: ExerciseContext[] = courseWork.flatMap(({ course, exercises }) =>
    exercises.map((exercise) => ({ courseId: course.id, courseName: course.name, exercise })),
  );
  const submissionResults = await mapWithConcurrency(exerciseContexts, REQUEST_CONCURRENCY, async (context) => {
    try {
      const submissions = await listAllPages((page) =>
        serverApis.assignments.listSubmissions(context.exercise.id, { page, pageSize: PAGE_SIZE }),
      );
      return {
        context,
        submissions: submissions.filter((submission) => submission.status === "Submitted"),
        failed: false,
      };
    } catch {
      return { context, submissions: [] as SubmissionDto[], failed: true };
    }
  });
  const pendingSubmissions = submissionResults
    .flatMap(({ context, submissions }) => submissions.map((submission) => ({
      courseId: context.courseId,
      courseName: context.courseName,
      exerciseId: context.exercise.id,
      exerciseTitle: context.exercise.title,
      submission,
    })))
    .sort((a, b) => Date.parse(b.submission.submittedAt ?? b.submission.createdAt) - Date.parse(a.submission.submittedAt ?? a.submission.createdAt));
  const enrollmentDataIncomplete = courseWork.some((item) => item.enrollmentFailed);
  const submissionDataIncomplete = courseWork.some((item) => item.exercisesFailed) || submissionResults.some((item) => item.failed);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={text("Teacher workspace")}
        title={`${text("Welcome back")}, ${user.fullName}`}
        description={text("Manage your course roster, assess student submissions, and author examinations.")}
        mascotSrc="/assets/owlie/teach.webp"
      />

      <div className="grid items-start gap-6 md:grid-cols-2">
        <PageSection
          title={isVi ? "Quản lý khóa học" : "Course management"}
          action={<TextLink href="/courses">{text("Manage courses")}</TextLink>}
        >
          <TeacherDashboardWorkTabs
            initialEnrollments={pendingEnrollments}
            initialSubmissions={pendingSubmissions}
            enrollmentDataIncomplete={enrollmentDataIncomplete}
            submissionDataIncomplete={submissionDataIncomplete}
          />
        </PageSection>

        <PageSection
          title={isVi ? "Quản lý ngân hàng câu hỏi" : "Question bank management"}
          action={<TextLink href="/question-banks">{text("Question banks")}</TextLink>}
        >
          {!banks.length ? (
            <EmptyState mascotSrc="/assets/owlie/think.webp">{isVi ? "Chưa có ngân hàng câu hỏi." : "No question banks yet."}</EmptyState>
          ) : (
            <div className="max-h-[calc(100vh-22rem)] min-h-64 overflow-y-auto pr-1">
            <DividedList>
              {banks.map((bank) => (
                <ListRow key={bank.id} href="/question-banks">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{bank.name}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{bank.description || text("No description provided.")}</p>
                  </div>
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
