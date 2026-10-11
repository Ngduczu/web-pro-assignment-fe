import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { ApiError } from "@/lib/api/errors";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";
import type {
  CourseDto,
  EnrollmentDto,
  ExaminationAttemptDto,
  ExerciseDto,
  StudentExaminationDto,
  SubmissionDto,
} from "@/types/api";
import {
  AlertBanner,
  DividedList,
  EmptyState,
  ListRow,
  TextLink,
} from "@/components/ui/page-chrome";
import { AreaRefreshButton } from "@/components/ui/area-refresh-button";

type StudentExamItem = {
  course: CourseDto;
  examination: StudentExaminationDto;
  attempt?: ExaminationAttemptDto;
};

type StudentExerciseItem = {
  course: CourseDto;
  exercise: ExerciseDto;
  submission?: SubmissionDto;
};

export async function StudentHome() {
  await connection();
  const { user } = await requireRole("Student");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const dateFormatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let courses: CourseDto[] = [];
  let enrollments: EnrollmentDto[] = [];
  let examItems: StudentExamItem[] = [];
  let exerciseItems: StudentExerciseItem[] = [];

  try {
    [courses, enrollments] = await Promise.all([
      serverApis.courses.listMine(),
      serverApis.enrollments.listMine(),
    ]);

    const acceptedCourseIds = new Set(
      enrollments.filter((e) => e.status === "Accepted").map((e) => e.courseId),
    );
    const activeCourses = courses.filter((c) => acceptedCourseIds.has(c.id));

    const courseDetails = await Promise.all(
      activeCourses.map(async (course) => {
        const [exercises, exams] = await Promise.all([
          serverApis.assignments.listExercises(course.id).catch(() => [] as ExerciseDto[]),
          serverApis.examinations.listAvailable(course.id).catch(() => [] as StudentExaminationDto[]),
        ]);

        const exerciseWithSubmissions = await Promise.all(
          exercises.map(async (exercise): Promise<StudentExerciseItem> => {
            let submission: SubmissionDto | undefined;
            try {
              submission = await serverApis.assignments.getMySubmission(exercise.id);
            } catch (err) {
              if (!(err instanceof ApiError && err.status === 404)) {
                // ignore
              }
            }
            return { course, exercise, submission };
          }),
        );

        const examWithAttempts = await Promise.all(
          exams.map(async (examination): Promise<StudentExamItem> => {
            let attempt: ExaminationAttemptDto | undefined;
            try {
              attempt = await serverApis.examinations.getMyAttempt(examination.id);
            } catch (err) {
              if (!(err instanceof ApiError && err.isNotFound)) {
                // ignore
              }
            }
            return { course, examination, attempt };
          }),
        );

        return { exerciseWithSubmissions, examWithAttempts };
      }),
    );

    examItems = courseDetails.flatMap((item) => item.examWithAttempts);
    exerciseItems = courseDetails.flatMap((item) => item.exerciseWithSubmissions);
  } catch {
    return <AlertBanner>{text("Dashboard data could not be loaded. Please try again later.")}</AlertBanner>;
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const pendingRequestsCount = enrollments.filter((e) => e.status === "Waiting").length;
  const upcomingAssignments = exerciseItems.filter(
    (item) => item.exercise.status === "Published" && (!item.submission || item.submission.status === "Draft"),
  ).sort((left, right) => {
    const createdDifference = new Date(right.exercise.createdAt).getTime() - new Date(left.exercise.createdAt).getTime();
    if (createdDifference !== 0) return createdDifference;
    const leftDueAt = left.exercise.dueAt ? new Date(left.exercise.dueAt).getTime() : Number.POSITIVE_INFINITY;
    const rightDueAt = right.exercise.dueAt ? new Date(right.exercise.dueAt).getTime() : Number.POSITIVE_INFINITY;
    return leftDueAt - rightDueAt;
  });
  const gradedSubmissions = exerciseItems.filter(
    (item) => item.submission && item.submission.status === "Graded" && item.submission.grade !== null,
  ).sort((left, right) =>
    new Date(right.submission!.gradedAt ?? right.submission!.modifiedAt).getTime() -
    new Date(left.submission!.gradedAt ?? left.submission!.modifiedAt).getTime());
  const activeExams = examItems.filter((item) => {
    const start = new Date(item.examination.startAt).getTime();
    const due = new Date(item.examination.dueAt).getTime();
    const isCompleted = item.attempt && (item.attempt.status === "Submitted" || item.attempt.status === "AutoSubmitted");
    return !isCompleted && now >= start && now <= due;
  }).sort((left, right) => new Date(left.examination.dueAt).getTime() - new Date(right.examination.dueAt).getTime());
  const upcomingExams = examItems
    .filter((item) => now < new Date(item.examination.startAt).getTime())
    .sort((left, right) => new Date(left.examination.startAt).getTime() - new Date(right.examination.startAt).getTime());

  const examRows = [
    ...activeExams.map((item) => ({ ...item, active: true })),
    ...upcomingExams.map((item) => ({ ...item, active: false })),
  ].slice(0, 4);

  const stats = [
    { label: text("Courses you are taking"), value: enrollments.filter((e) => e.status === "Accepted").length },
    { label: text("Assignments due soon"), value: upcomingAssignments.length },
    { label: text("Examinations coming up"), value: upcomingExams.length + activeExams.length },
    { label: text("Pending requests"), value: pendingRequestsCount },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 lg:col-span-7">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{text("Student workspace")}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{`${text("Welcome back")}, ${user.fullName}`}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <AreaRefreshButton label={language === "vi" ? "Làm mới tổng quan" : "Refresh overview"} loadingLabel={language === "vi" ? "Đang làm mới..." : "Refreshing..."} />
          <TextLink href="/courses" variant="primary">{text("Browse courses")}</TextLink>
          <TextLink href="/exams">{text("View examinations")}</TextLink>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:col-span-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <Tile className="lg:col-span-7" title={text("Assignments due soon")}>
        {!upcomingAssignments.length ? (
          <EmptyState>{text("No upcoming assignments from the available course data.")}</EmptyState>
        ) : (
          <DividedList>
            {upcomingAssignments.slice(0, 4).map(({ course, exercise }) => {
              const isPastDue = exercise.dueAt && new Date(exercise.dueAt).getTime() < now;
              return (
                <ListRow key={exercise.id} href={`/courses/${course.id}/exercises/${exercise.id}`}>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {course.name} · {isPastDue ? text("Overdue") : text("Pending")}
                    </p>
                    <p className="truncate font-medium">{exercise.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {exercise.dueAt ? dateFormatter.format(new Date(exercise.dueAt)) : text("No due date")}
                  </span>
                </ListRow>
              );
            })}
          </DividedList>
        )}
      </Tile>

      <Tile
        className={cn("lg:col-span-5", activeExams.length > 0 && "border-primary/40")}
        title={activeExams.length > 0 ? text("Examinations currently in progress") : text("Examinations coming up")}
        action={<Link href="/exams" className="text-sm font-medium text-primary hover:underline">{text("View examinations")}</Link>}
      >
        {!examRows.length ? (
          <EmptyState>{text("No upcoming examinations from the available course data.")}</EmptyState>
        ) : (
          <DividedList>
            {examRows.map(({ course, examination, attempt, active }) => (
              <ListRow key={examination.id} href={`/courses/${course.id}/examinations/${examination.id}`}>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {course.name} · {examination.durationMinutes} {text("minutes")}
                  </p>
                  <p className="truncate font-medium">{examination.title}</p>
                </div>
                <span className={cn("shrink-0 text-xs", active ? "font-medium text-primary" : "text-muted-foreground")}>
                  {active
                    ? attempt?.status === "InProgress" ? text("Resume exam") : text("Start exam")
                    : dateFormatter.format(new Date(examination.startAt))}
                </span>
              </ListRow>
            ))}
          </DividedList>
        )}
      </Tile>

      <Tile
        className="lg:col-span-5"
        title={text("Courses you are taking")}
        action={<Link href="/courses" className="text-sm font-medium text-primary hover:underline">{text("Browse courses")}</Link>}
      >
        {!courses.length ? (
          <EmptyState>{text("No courses are available yet.")}</EmptyState>
        ) : (
          <DividedList>
            {courses.slice(0, 4).map((course) => (
              <ListRow key={course.id} href={`/courses/${course.id}`}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{course.description || text("No description provided.")}</p>
                </div>
              </ListRow>
            ))}
          </DividedList>
        )}
      </Tile>

      {gradedSubmissions.length > 0 ? (
        <Tile className="lg:col-span-7" title={text("Assignment results")}>
          <DividedList>
            {gradedSubmissions.slice(0, 4).map(({ course, exercise, submission }) => (
              <ListRow key={exercise.id} href={`/courses/${course.id}/exercises/${exercise.id}`}>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{course.name}</p>
                  <p className="truncate font-medium">{exercise.title}</p>
                </div>
                <p className="shrink-0 text-lg font-semibold text-primary">{submission!.grade}/10</p>
              </ListRow>
            ))}
          </DividedList>
        </Tile>
      ) : null}
    </div>
  );
}

function Tile({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
