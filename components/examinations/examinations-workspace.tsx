"use client";

import Link from "next/link";
import { useState } from "react";
import { CirclePlus } from "lucide-react";
import type { CourseDto, ExaminationDto, QuestionBankDto, Role, StudentExaminationDto } from "@/types/api";
import { ExaminationCard } from "@/components/examinations/examination-card";
import { ExaminationCreateDialog } from "@/components/examinations/examination-create-dialog";
import { useLanguage } from "@/lib/i18n";

type ExamItem = { course: CourseDto; examination: ExaminationDto | StudentExaminationDto };

export function ExaminationsWorkspace({ initialItems, courses, banks, role }: { initialItems: ExamItem[]; courses: CourseDto[]; banks: QuestionBankDto[]; role: Role }) {
  const { language } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [creating, setCreating] = useState(false);
  const text = language === "vi" ? {
    studentSchedule: "Lịch thi của bạn", assessmentSchedule: "Lịch khảo thí", summary: `${items.length} kỳ thi trong ${courses.length} khóa học.`, create: "Tạo kỳ thi", needBank: "Hãy tạo ngân hàng câu hỏi trước khi tạo kỳ thi.", openBanks: "Mở ngân hàng câu hỏi", empty: "Chưa có kỳ thi nào.",
  } : {
    studentSchedule: "Your examination schedule", assessmentSchedule: "Assessment schedule", summary: `${items.length} examination${items.length === 1 ? "" : "s"} across ${courses.length} course${courses.length === 1 ? "" : "s"}.`, create: "Create examination", needBank: "Create a question bank before creating an examination.", openBanks: "Open question banks", empty: "No examinations are available yet.",
  };
  const sortedItems = [...items].sort((a, b) => new Date(a.examination.startAt).getTime() - new Date(b.examination.startAt).getTime());
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">{role === "Student" ? text.studentSchedule : text.assessmentSchedule}</h2><p className="mt-1 text-sm text-muted-foreground">{text.summary}</p></div>{role !== "Student" ? <button disabled={!courses.length || !banks.length} onClick={() => setCreating(true)} className="inline-flex h-10 items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><CirclePlus className="size-4" />{text.create}</button> : null}</div>
    {role !== "Student" && !banks.length ? <div className="border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700">{text.needBank} <Link href="/question-banks" className="font-medium underline">{text.openBanks}</Link></div> : null}
    {!sortedItems.length ? <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text.empty}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sortedItems.map(({ course, examination }) => <ExaminationCard key={examination.id} course={course} examination={examination} />)}</div>}
    {creating ? <ExaminationCreateDialog courses={courses} banks={banks} onClose={() => setCreating(false)} onCreated={(course, examination) => { setItems((current) => [{ course, examination }, ...current]); setCreating(false); }} /> : null}
  </div>;
}
