"use client";

import Link from "next/link";
import { useState, type DragEvent, type ReactNode } from "react";
import { BookOpen, ChevronDown, ChevronUp, ClipboardList, GraduationCap, GripVertical, Settings2 } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ExaminationDto, ExerciseDto, LessonDto, StudentExaminationDto } from "@/types/api";

export type CourseDetailTab = "lessons" | "assignments" | "examinations" | "management";

const copy = {
  en: {
    tabsLabel: "Course content", lessons: "Lessons", assignments: "Assignments", exams: "Examinations", management: "Course management",
    lessonDescription: "Organize course content in the order students should study it.", reorderHint: "Drag lessons to reorder them, or use the arrow buttons on mobile.",
    savingOrder: "Saving lesson order...", reorderFailed: "The new lesson order could not be saved.", moveUp: "Move lesson up", moveDown: "Move lesson down", dragLesson: "Drag to reorder lesson", noLessons: "No lessons are available yet.",
    assignmentDescription: "Assignments and submission deadlines for this course.", noAssignments: "No assignments are available yet.", examDescription: "Scheduled assessments and available results.", allExams: "Cross-course examination schedule", noExams: "No examinations are available yet.",
    noDescription: "No description provided.", due: "Due", questions: "questions", minutes: "minutes", draft: "Draft", published: "Published", closed: "Closed",
  },
  vi: {
    tabsLabel: "Nội dung khóa học", lessons: "Bài học", assignments: "Bài tập", exams: "Kỳ thi", management: "Quản trị khóa học",
    lessonDescription: "Sắp xếp nội dung theo đúng thứ tự học viên nên học.", reorderHint: "Kéo thả để đổi thứ tự bài học hoặc dùng các nút mũi tên trên điện thoại.",
    savingOrder: "Đang lưu thứ tự bài học...", reorderFailed: "Không thể lưu thứ tự bài học mới.", moveUp: "Đưa bài học lên", moveDown: "Đưa bài học xuống", dragLesson: "Kéo để đổi thứ tự bài học", noLessons: "Chưa có bài học nào.",
    assignmentDescription: "Bài tập và hạn nộp trong khóa học này.", noAssignments: "Chưa có bài tập nào.", examDescription: "Lịch kỳ thi và kết quả hiện có.", allExams: "Lịch thi của tất cả khóa học", noExams: "Chưa có kỳ thi nào.",
    noDescription: "Chưa có mô tả.", due: "Hạn", questions: "câu hỏi", minutes: "phút", draft: "Bản nháp", published: "Đã công bố", closed: "Đã đóng",
  },
};

type CourseDetailTabsProps = {
  courseId: string;
  lessons: LessonDto[];
  exercises: ExerciseDto[];
  examinations: (ExaminationDto | StudentExaminationDto)[];
  canManage?: boolean;
  lessonAction?: ReactNode;
  assignmentAction?: ReactNode;
  examinationAction?: ReactNode;
  management?: ReactNode;
  initialTab?: CourseDetailTab;
};

export function CourseDetailTabs({ courseId, lessons, exercises, examinations, canManage = false, lessonAction, assignmentAction, examinationAction, management, initialTab = "lessons" }: CourseDetailTabsProps) {
  const { language } = useLanguage();
  const text = copy[language];
  const [active, setActive] = useState<CourseDetailTab>(initialTab);
  const [orderedLessons, setOrderedLessons] = useState(() => [...lessons].sort((a, b) => a.order - b.order));
  const [draggedLessonId, setDraggedLessonId] = useState<string>();
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string>();
  const date = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium" });
  const status = (value: string) => ({ Draft: text.draft, Published: text.published, Closed: text.closed })[value as "Draft" | "Published" | "Closed"] ?? value;
  const tabs = [
    { id: "lessons" as const, label: text.lessons, icon: BookOpen, count: orderedLessons.length },
    { id: "assignments" as const, label: text.assignments, icon: ClipboardList, count: exercises.length },
    { id: "examinations" as const, label: text.exams, icon: GraduationCap, count: examinations.length },
    ...(management ? [{ id: "management" as const, label: text.management, icon: Settings2 }] : []),
  ];

  async function saveLessonOrder(next: LessonDto[], previous: LessonDto[]) {
    setOrderedLessons(next.map((lesson, index) => ({ ...lesson, order: index + 1 })));
    setReorderError(undefined);
    setReordering(true);
    try {
      const saved = await clientApis.lessons.reorder(courseId, next.map((lesson) => lesson.id));
      setOrderedLessons([...saved].sort((a, b) => a.order - b.order));
    } catch (error) {
      setOrderedLessons(previous);
      setReorderError(language === "en" && error instanceof ApiError ? error.detail : text.reorderFailed);
    } finally {
      setReordering(false);
      setDraggedLessonId(undefined);
    }
  }

  function moveLesson(fromIndex: number, toIndex: number) {
    if (!canManage || reordering || fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= orderedLessons.length) return;
    const previous = [...orderedLessons];
    const next = [...orderedLessons];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    void saveLessonOrder(next, previous);
  }

  function dropLesson(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetId) {
      setDraggedLessonId(undefined);
      return;
    }
    moveLesson(orderedLessons.findIndex((lesson) => lesson.id === draggedLessonId), orderedLessons.findIndex((lesson) => lesson.id === targetId));
  }

  return <div className="space-y-6">
    <div role="tablist" aria-label={text.tabsLabel} className="flex gap-2 overflow-x-auto border-b border-border pb-3">
      {tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setActive(id)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-3 py-2 text-sm font-medium transition ${active === id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}><Icon className="size-4" />{label}{count !== undefined ? <span className={active === id ? "text-primary-foreground/75" : "text-muted-foreground"}>{count}</span> : null}</button>)}
    </div>

    {active === "lessons" ? <section role="tabpanel" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-semibold">{text.lessons}</h2><p className="mt-1 text-sm text-muted-foreground">{text.lessonDescription}</p>{canManage && orderedLessons.length > 1 ? <p className="mt-2 text-xs text-muted-foreground">{text.reorderHint}</p> : null}</div>{lessonAction ? <div className="shrink-0">{lessonAction}</div> : null}</div>
      {reordering ? <p role="status" className="text-sm text-primary">{text.savingOrder}</p> : null}
      {reorderError ? <p role="alert" className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{reorderError}</p> : null}
      {!orderedLessons.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{text.noLessons}</div> : <div className="divide-y divide-border border-y border-border">
        {orderedLessons.map((lesson, index) => <div key={lesson.id} draggable={canManage && !reordering} onDragStart={(event) => { setDraggedLessonId(lesson.id); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => { if (canManage) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }} onDrop={(event) => dropLesson(event, lesson.id)} onDragEnd={() => setDraggedLessonId(undefined)} className={`flex items-center gap-2 px-2 py-3 transition ${draggedLessonId === lesson.id ? "bg-primary/10 opacity-60" : "hover:bg-muted/40"}`}>
          {canManage ? <div className="flex shrink-0 items-center"><span title={text.dragLesson} className="hidden cursor-grab p-2 text-muted-foreground active:cursor-grabbing sm:inline-flex"><GripVertical className="size-4" /></span><div className="flex sm:hidden"><button type="button" disabled={reordering || index === 0} onClick={() => moveLesson(index, index - 1)} aria-label={`${text.moveUp}: ${lesson.name}`} className="p-2 text-muted-foreground disabled:opacity-25"><ChevronUp className="size-4" /></button><button type="button" disabled={reordering || index === orderedLessons.length - 1} onClick={() => moveLesson(index, index + 1)} aria-label={`${text.moveDown}: ${lesson.name}`} className="p-2 text-muted-foreground disabled:opacity-25"><ChevronDown className="size-4" /></button></div></div> : null}
          <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="flex min-w-0 flex-1 flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><span className="min-w-0 font-medium"><span className="mr-2 text-muted-foreground">{index + 1}.</span>{lesson.name}</span><span className="shrink-0 text-sm text-muted-foreground">{status(lesson.status)}</span></Link>
        </div>)}
      </div>}
    </section> : null}

    {active === "assignments" ? <section role="tabpanel" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-semibold">{text.assignments}</h2><p className="mt-1 text-sm text-muted-foreground">{text.assignmentDescription}</p></div>{assignmentAction ? <div className="shrink-0">{assignmentAction}</div> : null}</div>
      {!exercises.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{text.noAssignments}</div> : <div className="divide-y divide-border border-y border-border">{exercises.map((exercise) => <Link key={exercise.id} href={`/courses/${courseId}/exercises/${exercise.id}`} className="flex flex-col gap-1 px-2 py-4 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><span className="font-medium">{exercise.title}</span><p className="text-sm text-muted-foreground">{exercise.description || text.noDescription}</p></div><span className="shrink-0 text-sm text-muted-foreground">{status(exercise.status)}{exercise.dueAt ? ` · ${text.due} ${date.format(new Date(exercise.dueAt))}` : ""}</span></Link>)}</div>}
    </section> : null}

    {active === "examinations" ? <section role="tabpanel" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-semibold">{text.exams}</h2><p className="mt-1 text-sm text-muted-foreground">{text.examDescription}</p><Link href="/exams" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">{text.allExams}</Link></div>{examinationAction ? <div className="shrink-0 sm:max-w-sm">{examinationAction}</div> : null}</div>
      {!examinations.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{text.noExams}</div> : <div className="divide-y divide-border border-y border-border">{examinations.map((exam) => <Link key={exam.id} href={`/courses/${courseId}/examinations/${exam.id}`} className="flex flex-col gap-1 px-2 py-4 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><span className="font-medium">{exam.title}</span><p className="text-sm text-muted-foreground">{exam.questionCount} {text.questions} · {exam.durationMinutes} {text.minutes}</p></div><span className="shrink-0 text-sm text-muted-foreground">{status(exam.status)} · {date.format(new Date(exam.startAt))}</span></Link>)}</div>}
    </section> : null}

    {active === "management" && management ? <section role="tabpanel">{management}</section> : null}
  </div>;
}
