"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { QuestionDto } from "@/types/api";

export function QuestionCard({ question, index, onEdit, onDelete }: { question: QuestionDto; index: number; onEdit: () => void; onDelete: () => void }) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const questionType = question.type === "MultipleChoice"
    ? (isVi ? "Trắc nghiệm một lựa chọn" : "Multiple choice")
    : (isVi ? "Điền vào chỗ trống" : "Fill in blank");
  const difficulty = isVi
    ? ({ Easy: "Dễ", Medium: "Trung bình", Hard: "Khó" }[question.difficulty] ?? question.difficulty)
    : question.difficulty;

  return <article className="border border-border bg-card p-4 sm:p-5"><div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center bg-muted text-xs font-semibold">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-primary">{questionType}</span><span className="text-xs text-muted-foreground">{difficulty}</span></div><p className="mt-2 whitespace-pre-wrap font-medium">{question.content}</p>{question.type === "MultipleChoice" ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <div key={option.id} className={`flex items-center gap-2 border px-3 py-2 text-sm ${option.isCorrect ? "border-emerald-600/30 bg-emerald-500/5 text-emerald-700" : "border-border"}`}>{option.isCorrect ? <Check className="size-4" /> : <span className="size-4 rounded-full border border-border" />}{option.content}</div>)}</div> : <div className="mt-4 flex flex-wrap gap-2">{question.answers.map((answer) => <span key={answer.id} className="border border-emerald-600/30 bg-emerald-500/5 px-3 py-1 text-sm text-emerald-700">{isVi ? "Chỗ trống" : "Blank"} {answer.blankOrder}: {answer.expectedAnswer}</span>)}</div>}</div><div className="flex shrink-0 gap-1"><button onClick={onEdit} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={isVi ? "Chỉnh sửa câu hỏi" : "Edit question"}><Pencil className="size-4" /></button><button onClick={onDelete} className="p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive" aria-label={isVi ? "Xóa câu hỏi" : "Delete question"}><Trash2 className="size-4" /></button></div></div></article>;
}

