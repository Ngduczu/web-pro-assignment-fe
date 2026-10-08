import { Suspense } from "react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { ExaminationsWorkspace } from "@/components/examinations/examinations-workspace";
import type { CourseDto, QuestionBankDto } from "@/types/api";
import { getServerLanguage, translate } from "@/lib/i18n-server";

async function ExamsContent() {
  await connection();
  const { user } = await requireAuth();
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  let courses;
  let settled;
  let banks: QuestionBankDto[];
  try {
    courses = user.role === "Student" ? await serverApis.courses.listMine() : (await serverApis.courses.list({ teacherId: user.role === "Teacher" ? user.id : undefined, pageSize: 100 })).items;
    settled = await Promise.allSettled(courses.map(async (course) => ({ course, examinations: user.role === "Student" ? await serverApis.examinations.listAvailable(course.id) : await serverApis.examinations.listByCourse(course.id) })));
    banks = user.role === "Student" ? [] : await serverApis.questions.listBanks(user.role === "Teacher" ? user.id : undefined);
  } catch { return <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{text("Examinations could not be loaded.")}</div>; }
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value.examinations.map((examination) => ({ course: result.value.course, examination })) : []);
  return <section className="space-y-8"><header className="max-w-3xl"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{text("Assessment center")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{text("Examinations")}</h1><p className="mt-3 text-muted-foreground">{user.role === "Student" ? text("Review your schedule, enter active examinations and revisit released results.") : text("Create, schedule and control examinations across your courses.")}</p></header>{settled.some((result) => result.status === "rejected") ? <div className="border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700">{text("Some course examinations could not be loaded.")}</div> : null}<ExaminationsWorkspace initialItems={items} courses={courses as CourseDto[]} banks={banks} role={user.role} /></section>;
}

export default function ExamsPage() { return <Suspense fallback={<DashboardSkeleton />}><ExamsContent /></Suspense>; }
