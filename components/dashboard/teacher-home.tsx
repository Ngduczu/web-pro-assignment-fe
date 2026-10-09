import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import type {
  CourseDto,
  EnrollmentDto,
  ExaminationDto,
  ExerciseDto,
  QuestionBankDto,
  SubmissionDto,
} from "@/types/api";
import { TeacherEnrollmentsQueue } from "@/components/teacher/teacher-enrollments-queue";
import {
  AlertBanner,
  DividedList,
  EmptyState,
  ListRow,
  PageHeader,
  PageSection,
  TextLink,
} from "@/components/ui/page-chrome";

type PendingSubmissionItem = {
  course: CourseDto;
  exercise: ExerciseDto;
  submission: SubmissionDto;
};

export async function TeacherHome() {
  await connection();
  const { user } = await requireRole("Teacher");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const isVi = language === "vi";
  const dateFormatter = new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let courses: CourseDto[] = [];
  let banks: QuestionBankDto[] = [];
  const allEnrollments: { courseName: string; courseId: string; enrollment: EnrollmentDto }[] = [];
  const pendingSubmissions: PendingSubmissionItem[] = [];
  const examinations: { course: CourseDto; examination: ExaminationDto }[] = [];

  try {
    const [coursesResult, banksResult] = await Promise.all([
      serverApis.courses.list({ teacherId: user.id, pageSize: 100 }),
      serverApis.questions.listBanks(user.id),
    ]);
    courses = coursesResult.items;
    banks = banksResult;

    await Promise.all(
      courses.map(async (course) => {
        const [enrollmentRes, exercises, exams] = await Promise.all([
          serverApis.enrollments.listByCourse(course.id, { pageSize: 100 }).catch(() => ({ items: [] as EnrollmentDto[] })),
          serverApis.assignments.listExercises(course.id).catch(() => [] as ExerciseDto[]),
          serverApis.examinations.listByCourse(course.id).catch(() => [] as ExaminationDto[]),
        ]);

        enrollmentRes.items
          .filter((e) => e.status === "Waiting")
          .forEach((enrollment) => {
            allEnrollments.push({ courseName: course.name, courseId: course.id, enrollment });
          });

        exams.forEach((examination) => {
          examinations.push({ course, examination });
        });

        await Promise.all(
          exercises.map(async (exercise) => {
            try {
              const subs = await serverApis.assignments.listSubmissions(exercise.id, { pageSize: 50 });
              subs.items
                .filter((sub) => sub.status === "Submitted")
                .forEach((submission) => {
                  pendingSubmissions.push({ course, exercise, submission });
                });
            } catch {
              // ignore
            }
          }),
        );
      }),
    );
  } catch {
    return <AlertBanner>{text("Dashboard data could not be loaded. Please try again later.")}</AlertBanner>;
  }

  pendingSubmissions.sort((left, right) =>
    new Date(right.submission.submittedAt ?? right.submission.modifiedAt).getTime() -
    new Date(left.submission.submittedAt ?? left.submission.modifiedAt).getTime());
  allEnrollments.sort((left, right) =>
    new Date(right.enrollment.createdAt).getTime() - new Date(left.enrollment.createdAt).getTime());
  examinations.sort((left, right) =>
    new Date(left.examination.startAt).getTime() - new Date(right.examination.startAt).getTime());

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={text("Teacher workspace")}
        title={`${text("Welcome back")}, ${user.fullName}`}
        description={text("Manage your course roster, assess student submissions, and author examinations.")}
        actions={
          <>
            <TextLink href="/courses" variant="primary">{text("Manage courses")}</TextLink>
            <TextLink href="/exams">{text("Manage examinations")}</TextLink>
            <TextLink href="/question-banks">{text("Question banks")}</TextLink>
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <PageSection
          className="lg:col-span-3"
          title={isVi ? "Hàng đợi chấm điểm" : "Submissions needing grading"}
          description={isVi ? "Bài làm của học viên đã nộp và đang chờ bạn cho điểm." : "Student coursework submitted and awaiting your assessment."}
          action={<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{pendingSubmissions.length}</span>}
        >
          {!pendingSubmissions.length ? (
            <EmptyState>
              {isVi
                ? "Tất cả bài tập đã được chấm điểm xong."
                : "All submitted coursework has been evaluated."}
            </EmptyState>
          ) : (
            <DividedList>
              {pendingSubmissions.slice(0, 6).map(({ course, exercise, submission }) => (
                <ListRow key={submission.id} href={`/courses/${course.id}/exercises/${exercise.id}`}>
                  <div>
                    <p className="text-xs text-muted-foreground">{course.name}</p>
                    <p className="font-medium">{exercise.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.student?.fullName || submission.studentId}
                      {submission.submittedAt ? ` · ${dateFormatter.format(new Date(submission.submittedAt))}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">{isVi ? "Chấm điểm" : "Grade now"}</span>
                </ListRow>
              ))}
            </DividedList>
          )}
        </PageSection>

        <PageSection
          className="lg:col-span-2"
          title={isVi ? "Yêu cầu tham gia lớp" : "Enrollment approval queue"}
          description={isVi ? "Duyệt nhanh học viên đang xin tham gia vào các khóa học của bạn." : "Quickly approve or reject students requesting to join your courses."}
          action={<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{allEnrollments.length}</span>}
        >
          <TeacherEnrollmentsQueue initialEnrollments={allEnrollments} />
        </PageSection>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/courses"
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <span className="text-sm text-muted-foreground">{text("Managed courses")}</span>
          <span className="text-lg font-semibold">{courses.length}</span>
        </Link>
        <Link
          href="/question-banks"
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <span className="text-sm text-muted-foreground">{text("Question banks")}</span>
          <span className="text-lg font-semibold">{banks.length}</span>
        </Link>
      </div>

      <PageSection
        title={text("Courses you manage")}
        description={isVi ? "Các khóa học bạn đang phụ trách." : "Courses currently assigned to you."}
        action={<Link href="/courses" className="text-sm font-medium text-primary hover:underline">{text("Open courses")}</Link>}
      >
        {!courses.length ? (
          <EmptyState>{text("No courses are available yet.")}</EmptyState>
        ) : (
          <DividedList>
            {courses.map((course) => (
              <ListRow key={course.id} href={`/courses/${course.id}`}>
                <div>
                  <p className="text-xs text-muted-foreground">{text(course.status)} · {text("Capacity")} {course.maxStudents}</p>
                  <p className="font-medium">{course.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{course.description || text("No description provided.")}</p>
                </div>
                <span className="text-sm text-primary">{text("View course")}</span>
              </ListRow>
            ))}
          </DividedList>
        )}
      </PageSection>

      <PageSection
        title={text("Examinations")}
        description={text("Create, schedule and control examinations across your courses.")}
        action={<Link href="/exams" className="text-sm font-medium text-primary hover:underline">{text("Manage examinations")}</Link>}
      >
        {!examinations.length ? (
          <EmptyState>{text("No upcoming examinations from the available course data.")}</EmptyState>
        ) : (
          <DividedList>
            {examinations.map(({ course, examination }) => (
              <ListRow key={examination.id} href={`/courses/${course.id}/examinations/${examination.id}`}>
                <div>
                  <p className="text-xs text-muted-foreground">{course.name} · {text(examination.status)}</p>
                  <p className="font-medium">{examination.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {examination.durationMinutes} {text("minutes")} · {examination.questionCount} {text("questions")} · {text("Starts")} {dateFormatter.format(new Date(examination.startAt))}
                  </p>
                </div>
                <span className="text-sm text-primary">{isVi ? "Bảng điểm" : "Results"}</span>
              </ListRow>
            ))}
          </DividedList>
        )}
      </PageSection>
    </div>
  );
}
