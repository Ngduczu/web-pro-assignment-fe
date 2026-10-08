import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { CourseDto, EnrollmentDto, ExaminationDto, ExerciseDto, LessonDto, QuestionBankDto, StudentExaminationDto } from "@/types/api";
import { CourseManagementPanel } from "@/components/courses/course-management-panel";
import { CourseDetailTabs, type CourseDetailTab } from "@/components/courses/course-detail-tabs";
import { CourseAccessNotice, CourseDetailHeader } from "@/components/courses/course-detail-header";
import { CourseAssessmentActions } from "@/components/courses/course-assessment-actions";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function CourseDetailPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ tab?: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId } = await params;
  const requestedTab = (await searchParams).tab;
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  let course: CourseDto;
  let enrollment: EnrollmentDto | undefined;
  let lessons: LessonDto[];
  let exercises: ExerciseDto[];
  let examinations: (ExaminationDto | StudentExaminationDto)[];
  let managedEnrollments: EnrollmentDto[] = [];
  let banks: QuestionBankDto[] = [];
  try {
    course = await serverApis.courses.get(courseId);
    if (user.role === "Student") {
      enrollment = await serverApis.enrollments.listMine().then((items) => items.find((item) => item.courseId === courseId));
      if (enrollment?.status === "Accepted") {
        [lessons, exercises, examinations] = await Promise.all([
          serverApis.lessons.list(courseId),
          serverApis.assignments.listExercises(courseId),
          serverApis.examinations.listAvailable(courseId),
        ]);
      } else {
        lessons = []; exercises = []; examinations = [];
      }
    } else {
      [lessons, exercises, managedEnrollments, examinations, banks] = await Promise.all([
        serverApis.lessons.list(courseId),
        serverApis.assignments.listExercises(courseId),
        serverApis.enrollments.listByCourse(courseId, { pageSize: 100 }).then((result) => result.items),
        serverApis.examinations.listByCourse(courseId),
        serverApis.questions.listBanks(user.role === "Teacher" ? user.id : undefined),
      ]);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{text("This course could not be loaded.")}</section>;
  }

  const hasAccess = user.role !== "Student" || enrollment?.status === "Accepted";
  const availableTabs: CourseDetailTab[] = user.role === "Student" ? ["lessons", "assignments", "examinations"] : ["lessons", "assignments", "examinations", "management"];
  const initialTab = availableTabs.includes(requestedTab as CourseDetailTab) ? requestedTab as CourseDetailTab : "lessons";

  return (
    <section className="space-y-8">
      <CourseDetailHeader course={course} role={user.role} enrollment={enrollment} />
      {!hasAccess ? <CourseAccessNotice /> : <CourseDetailTabs
        key={lessons.map((lesson) => `${lesson.id}:${lesson.order}`).join("|")}
        courseId={course.id}
        lessons={lessons}
        exercises={exercises}
        examinations={examinations}
        initialTab={initialTab}
        canManage={user.role !== "Student"}
        lessonAction={user.role !== "Student" ? <CourseAssessmentActions kind="lesson" course={course} banks={banks} nextLessonOrder={Math.max(0, ...lessons.map((lesson) => lesson.order)) + 1} /> : undefined}
        assignmentAction={user.role !== "Student" ? <CourseAssessmentActions kind="assignment" course={course} banks={banks} nextLessonOrder={Math.max(0, ...lessons.map((lesson) => lesson.order)) + 1} /> : undefined}
        examinationAction={user.role !== "Student" ? <CourseAssessmentActions kind="examination" course={course} banks={banks} nextLessonOrder={Math.max(0, ...lessons.map((lesson) => lesson.order)) + 1} /> : undefined}
        management={user.role !== "Student" ? <CourseManagementPanel course={course} enrollments={managedEnrollments} /> : undefined}
      />}
    </section>
  );
}
