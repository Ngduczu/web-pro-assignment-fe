import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";

export default async function LegacyExaminationPage({ params }: { params: Promise<{ examinationId: string }> }) {
  await connection();
  const { user } = await requireAuth();
  const { examinationId } = await params;
  try {
    const examination = user.role === "Student"
      ? await serverApis.examinations.getForStudent(examinationId)
      : await serverApis.examinations.get(examinationId);
    redirect(`/courses/${examination.courseId}/examinations/${examinationId}`);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) notFound();
    throw error;
  }
}
