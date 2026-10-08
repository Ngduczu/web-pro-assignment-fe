import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { ExerciseDto, PaginatedResponse, SubmissionDto } from "@/types/api";
import { ExerciseWorkspace } from "@/components/courses/exercise-workspace";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ courseId: string; exerciseId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { courseId, exerciseId } = await params;
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  let course;
  let exercise: ExerciseDto;
  let submission: SubmissionDto | undefined;
  let submissions: PaginatedResponse<SubmissionDto> | undefined;

  try {
    course = await serverApis.courses.get(courseId);
    exercise = await serverApis.assignments.getExercise(exerciseId);
    if (user.role === "Student") {
      try {
        submission = await serverApis.assignments.getMySubmission(exerciseId);
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 404)) throw error;
      }
    } else {
      submissions = await serverApis.assignments.listSubmissions(exerciseId, { page: 1, pageSize: 20 });
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{text("This assignment could not be loaded.")}</section>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm"><Link href={`/courses/${courseId}`} className="font-medium text-primary hover:underline">{course.name}</Link><span className="text-muted-foreground">/ {text("Assignment")}</span></div>
      <header className="max-w-3xl space-y-3"><div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span>{text(exercise.status)}</span>{exercise.dueAt ? <span>{text("Due")} {new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(exercise.dueAt))}</span> : null}</div><h1 className="text-3xl font-semibold tracking-tight">{exercise.title}</h1><p className="whitespace-pre-wrap leading-7 text-muted-foreground">{exercise.description || text("No description provided.")}</p></header>
      <ExerciseWorkspace
        exercise={exercise}
        submission={submission}
        submissions={submissions ?? { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }}
        canManage={user.role === "Teacher" || user.role === "Admin"}
      />
    </section>
  );
}
