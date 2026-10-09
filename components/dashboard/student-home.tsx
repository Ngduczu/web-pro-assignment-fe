import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { ApiError } from "@/lib/api/errors";
import { getServerLanguage, translate } from "@/lib/i18n-server";
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
  PageHeader,
  PageSection,
  TextLink,
} from "@/components/ui/page-chrome";

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={text("Student workspace")}
        title={`${text("Welcome back")}, ${user.fullName}`}
        description={text("Track your assignments, prepare for examinations, and access your course material.")}
        actions={
          <>
            <TextLink href="/courses" variant="primary">{text("Browse courses")}</TextLink>
            <TextLink href="/exams">{text("View examinations")}</TextLink>
          </>
        }
      />

      {activeExams.length > 0 ? (
        <PageSection
          className="border-primary/30"
          title={text("Examinations currently in progress")}
          description={text("You have an active examination available to take right now. Enter before the deadline expires.")}
        >
          <DividedList>
            {activeExams.map(({ course, examination, attempt }) => (
              <ListRow key={examination.id} href={`/courses/${course.id}/examinations/${examination.id}`}>
                <div>
                  <p className="text-xs text-muted-foreground">{course.name}</p>
                  <p className="font-medium">{examination.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {examination.durationMinutes} {text("minutes")} · {examination.questionCount} {text("questions")}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {attempt?.status === "InProgress" ? text("Resume exam") : text("Start exam")}
                </span>
              </ListRow>
            ))}
          </DividedList>
        </PageSection>
      ) : null}

      <PageSection
        title={text("Assignments due soon")}
        description={text("Prioritize the work you still need to submit.")}
        action={<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{upcomingAssignments.length}</span>}
      >
        {!upcomingAssignments.length ? (
          <EmptyState>{text("No upcoming assignments from the available course data.")}</EmptyState>
        ) : (
          <DividedList>
            {upcomingAssignments.slice(0, 5).map(({ course, exercise, submission }) => {
              const isSubmitted = submission?.status === "Submitted" || submission?.status === "Graded";
              const isGraded = submission?.status === "Graded";
              const isPastDue = exercise.dueAt && new Date(exercise.dueAt).getTime() < now;
              const status = isGraded
                ? `${text("Graded")}: ${submission!.grade}/10`
                : isSubmitted
                  ? text("Submitted")
                  : isPastDue
                    ? text("Overdue")
                    : text("Pending");
              return (
                <ListRow key={exercise.id} href={`/courses/${course.id}/exercises/${exercise.id}`}>
                  <div>
                    <p className="text-xs text-muted-foreground">{course.name} · {status}</p>
                    <p className="font-medium">{exercise.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.dueAt ? `${text("Due")} ${dateFormatter.format(new Date(exercise.dueAt))}` : text("No due date")}
                    </p>
                  </div>
                  <span className="text-sm text-primary">{isSubmitted ? text("View submission") : text("Open assignment")}</span>
                </ListRow>
              );
            })}
          </DividedList>
        )}
      </PageSection>

      <PageSection
        title={text("Examinations coming up")}
        description={text("Check the next scheduled examinations across your courses.")}
        action={<Link href="/exams" className="text-sm font-medium text-primary hover:underline">{text("View examinations")}</Link>}
      >
        {!upcomingExams.length ? (
          <EmptyState>{text("No upcoming examinations from the available course data.")}</EmptyState>
        ) : (
          <DividedList>
            {upcomingExams.slice(0, 5).map(({ course, examination, attempt }) => {
              const isFinished = attempt && (attempt.status === "Submitted" || attempt.status === "AutoSubmitted");
              const hasScore = attempt?.score !== null && attempt?.score !== undefined;
              return (
                <ListRow key={examination.id} href={`/courses/${course.id}/examinations/${examination.id}`}>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {course.name} · {isFinished ? (hasScore ? `${text("Score")}: ${attempt!.score}/10` : text("Submitted")) : `${examination.durationMinutes} ${text("minutes")}`}
                    </p>
                    <p className="font-medium">{examination.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {text("Starts")} {dateFormatter.format(new Date(examination.startAt))}
                    </p>
                  </div>
                  <span className="text-sm text-primary">{isFinished ? text("View results") : text("Open examination")}</span>
                </ListRow>
              );
            })}
          </DividedList>
        )}
      </PageSection>

      <PageSection
        title={text("Courses you are taking")}
        description={text("Learning spaces where your enrollment is confirmed.")}
        action={<Link href="/courses" className="text-sm font-medium text-primary hover:underline">{text("Browse courses")}</Link>}
      >
        {!courses.length ? (
          <EmptyState>{text("No courses are available yet.")}</EmptyState>
        ) : (
          <DividedList>
            {courses.map((course) => (
              <ListRow key={course.id} href={`/courses/${course.id}`}>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{text(course.status)}</p>
                  <p className="font-medium">{course.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{course.description || text("No description provided.")}</p>
                </div>
                <span className="shrink-0 text-sm text-primary">{text("Open courses")}</span>
              </ListRow>
            ))}
          </DividedList>
        )}
      </PageSection>

        {gradedSubmissions.length > 0 ? (
          <PageSection
            title={text("Assignment results")}
            description={text("Your latest grades and teacher feedback.")}
          >
            <DividedList>
              {gradedSubmissions.slice(0, 5).map(({ course, exercise, submission }) => (
                <ListRow key={exercise.id} href={`/courses/${course.id}/exercises/${exercise.id}`}>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{course.name}</p>
                    <p className="font-medium">{exercise.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {submission!.feedback || text("No written feedback was provided.")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-primary">{submission!.grade}/10</p>
                    <span className="text-sm text-primary">{text("View details")}</span>
                  </div>
                </ListRow>
              ))}
            </DividedList>
          </PageSection>
        ) : null}

      {pendingRequestsCount > 0 ? (
        <AlertBanner tone="warning">
          {text("Pending requests")}: {pendingRequestsCount} {text("course enrollment request(s) waiting for teacher approval.")}
        </AlertBanner>
      ) : null}
    </div>
  );
}
