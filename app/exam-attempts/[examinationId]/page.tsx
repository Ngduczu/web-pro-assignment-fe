import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { StudentExaminationWorkspace } from "@/components/examinations/examination-detail-workspace";
import type { ExaminationAttemptDto, StudentExaminationDto } from "@/types/api";

const examRoute = (courseId: string, examinationId: string) =>
  `/courses/${courseId}/examinations/${examinationId}`;

export const instant = false;

export default async function ExaminationAttemptPage({
  params,
}: {
  params: Promise<{ examinationId: string }>;
}) {
  await connection();
  await requireRole("Student");
  const { examinationId } = await params;
  const language = await getServerLanguage();
  let exam: StudentExaminationDto;
  let attempt: ExaminationAttemptDto | undefined;

  try {
    exam = await serverApis.examinations.getForStudent(examinationId);
    try {
      attempt = await serverApis.examinations.getMyAttempt(examinationId);
    } catch (error) {
      if (!(error instanceof ApiError && error.isNotFound)) throw error;
    }
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) redirect("/courses");
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-5">
        <section role="alert" className="w-full rounded-2xl border border-destructive/30 bg-card p-6 text-sm text-destructive">
          {translate(language, "This examination could not be loaded.")}
        </section>
      </main>
    );
  }

  if (!attempt || (attempt.status !== "InProgress" && attempt.status !== "Disconnected")) {
    redirect(examRoute(exam.courseId, exam.id));
  }

  return (
    <main className="motion-page-enter min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl border border-border bg-card px-4 py-3 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {translate(language, "Examination in progress")}
          </p>
          <h1 className="mt-1 wrap-break-word text-lg font-semibold sm:text-xl">{exam.title}</h1>
        </header>
        <StudentExaminationWorkspace exam={exam} initialAttempt={attempt} standalone />
      </div>
    </main>
  );
}