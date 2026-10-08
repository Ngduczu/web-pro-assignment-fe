import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { CourseExaminationHeader } from "@/components/examinations/course-examination-header";
import { ExaminationManager, StudentExaminationWorkspace } from "@/components/examinations/examination-detail-workspace";
import type { CourseDto, ExaminationAttemptDto, ExaminationAttemptResultDto, ExaminationDto, PaginatedResponse, StudentExaminationDto } from "@/types/api";

async function CourseExaminationDetail({ courseId, examinationId }: { courseId: string; examinationId: string }) {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  let examination: ExaminationDto | StudentExaminationDto;
  let course: CourseDto;
  let attempt: ExaminationAttemptDto | undefined;
  let results: PaginatedResponse<ExaminationAttemptResultDto> | undefined;

  try {
    examination = user.role === "Student"
      ? await serverApis.examinations.getForStudent(examinationId)
      : await serverApis.examinations.get(examinationId);
    if (examination.courseId !== courseId) notFound();
    course = await serverApis.courses.get(courseId);

    if (user.role === "Student") {
      try {
        attempt = await serverApis.examinations.getMyAttempt(examinationId);
      } catch (error) {
        if (!(error instanceof ApiError && error.isNotFound)) throw error;
      }
    } else {
      results = await serverApis.examinations.listAttempts(examinationId, { page: 1, pageSize: 20 });
    }
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) notFound();
    return <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{translate(language, "This examination could not be loaded.")}</div>;
  }

  return (
    <section className="space-y-8">
      <CourseExaminationHeader course={course} examination={examination} language={language} />
      {user.role === "Student"
        ? <StudentExaminationWorkspace exam={examination as StudentExaminationDto} initialAttempt={attempt} />
        : <ExaminationManager initialExam={examination as ExaminationDto} initialResults={results ?? { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }} />}
    </section>
  );
}

export default async function CourseExaminationPage({ params }: { params: Promise<{ courseId: string; examinationId: string }> }) {
  const { courseId, examinationId } = await params;
  return <Suspense fallback={<DashboardSkeleton />}><CourseExaminationDetail courseId={courseId} examinationId={examinationId} /></Suspense>;
}
