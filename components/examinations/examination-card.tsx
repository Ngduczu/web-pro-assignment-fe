import Link from "next/link";
import { CalendarClock, Clock3, ShieldCheck } from "lucide-react";
import type { CourseDto, ExaminationDto, StudentExaminationDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: { finished: "Finished", upcoming: "Upcoming", open: "Open now", noDescription: "No description provided.", minutes: "minutes", questions: "questions" },
  vi: { finished: "Đã kết thúc", upcoming: "Sắp diễn ra", open: "Đang mở", noDescription: "Chưa có mô tả.", minutes: "phút", questions: "câu hỏi" },
};

export function ExaminationCard({ course, examination }: { course: CourseDto; examination: ExaminationDto | StudentExaminationDto }) {
  const { language } = useLanguage();
  const text = copy[language];
  const formatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" });
  const now = new Date();
  const finished = examination.status === "Closed" || now >= new Date(examination.dueAt);
  const upcoming = now < new Date(examination.startAt);
  const timing = finished ? { label: text.finished, tone: "text-muted-foreground bg-muted" } : upcoming ? { label: text.upcoming, tone: "text-amber-700 bg-amber-500/10" } : { label: text.open, tone: "text-emerald-700 bg-emerald-500/10" };
  return <Link href={`/courses/${course.id}/examinations/${examination.id}`} className="group flex min-h-64 flex-col justify-between border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center bg-primary/10 text-primary"><CalendarClock className="size-5" /></span><span className={`px-2.5 py-1 text-xs font-medium ${timing.tone}`}>{timing.label}</span></div><p className="mt-5 text-xs font-medium uppercase tracking-wider text-primary">{course.name}</p><h3 className="mt-2 text-xl font-semibold group-hover:text-primary">{examination.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{examination.description || text.noDescription}</p></div><div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{examination.durationMinutes} {text.minutes}</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />{examination.questionCount} {text.questions}</span><span className="col-span-2">{formatter.format(new Date(examination.startAt))}</span></div></Link>;
}
