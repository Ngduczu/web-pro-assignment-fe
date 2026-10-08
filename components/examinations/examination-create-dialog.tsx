"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import type { CourseDto, ExaminationDto, ExaminationSecuritySettings, QuestionBankDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";
import { ExaminationQuestionSelector, type ExaminationQuestionSelection } from "@/components/examinations/examination-question-selector";
import { ExaminationSecurityFields } from "@/components/examinations/examination-security-fields";

const field = "h-10 w-full border border-input bg-background px-3 text-sm";
const initialSelection: ExaminationQuestionSelection = { mode: "Random", rules: [{ questionBankId: "", difficulty: "Medium", questionCount: 1 }], questionIds: [] };
const initialSecurity: ExaminationSecuritySettings = { requireFullscreen: false, fullscreenGraceSeconds: 10, maxViolations: 3, blockCopyPaste: true, blockRightClick: true, detectTabChange: true, detectDevTools: false, maxDisconnectMinutes: 5 };
const copy = {
  en: { close: "Close", heading: "Create examination", intro: "Choose questions manually or generate a snapshot randomly from question banks.", course: "Course", title: "Title", description: "Description", starts: "Starts", ends: "Ends", duration: "Duration (minutes)", cancel: "Cancel", creating: "Creating...", create: "Create draft", failure: "Unable to create examination.", manualRequired: "Select at least one question.", randomRequired: "Add at least one valid random selection rule.", maximumQuestions: "An examination can contain at most 500 questions." },
  vi: { close: "Đóng", heading: "Tạo kỳ thi", intro: "Chọn thủ công từng câu hoặc tạo bản chụp ngẫu nhiên từ ngân hàng câu hỏi.", course: "Khóa học", title: "Tiêu đề", description: "Mô tả", starts: "Bắt đầu", ends: "Kết thúc", duration: "Thời lượng (phút)", cancel: "Hủy", creating: "Đang tạo...", create: "Tạo bản nháp", failure: "Không thể tạo kỳ thi.", manualRequired: "Hãy chọn ít nhất một câu hỏi.", randomRequired: "Hãy thêm ít nhất một quy tắc chọn ngẫu nhiên hợp lệ.", maximumQuestions: "Mỗi kỳ thi chỉ được có tối đa 500 câu hỏi." },
};

export function ExaminationCreateDialog({ courses, banks, onClose, onCreated }: { courses: CourseDto[]; banks: QuestionBankDto[]; onClose: () => void; onCreated: (course: CourseDto, examination: ExaminationDto) => void }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [security, setSecurity] = useState(initialSecurity);
  const [selection, setSelection] = useState(initialSelection);
  const selectedCourse = courses.find((course) => course.id === courseId);
  const availableBanks = useMemo(() => banks.filter((bank) => !selectedCourse || bank.teacherId === selectedCourse.teacherId), [banks, selectedCourse]);

  function changeCourse(nextCourseId: string) {
    setCourseId(nextCourseId);
    setSelection(initialSelection);
    setError(undefined);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const questionCount = selection.mode === "Manual" ? selection.questionIds.length : selection.rules.reduce((sum, rule) => sum + Math.max(0, rule.questionCount || 0), 0);
    if (selection.mode === "Manual" && !selection.questionIds.length) { setError(text.manualRequired); return; }
    if (selection.mode === "Random" && (!selection.rules.length || selection.rules.some((rule) => !rule.questionBankId || rule.questionCount < 1))) { setError(text.randomRequired); return; }
    if (questionCount > 500) { setError(text.maximumQuestions); return; }
    setBusy(true); setError(undefined);
    try {
      const examination = await clientApis.examinations.create(courseId, {
        title: title.trim(), description: description.trim() || null,
        startAt: new Date(startAt).toISOString(), dueAt: new Date(dueAt).toISOString(), durationMinutes: duration,
        shuffleQuestions, showScoreImmediately: showScore, security,
        selectionMode: selection.mode,
        questionSelectionRules: selection.mode === "Random" ? selection.rules : [],
        questionIds: selection.mode === "Manual" ? selection.questionIds : [],
      });
      onCreated(courses.find((course) => course.id === courseId)!, examination);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.failure);
    } finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
    <button type="button" className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} aria-label={text.close} />
    <form onSubmit={submit} className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6">
      <div className="flex justify-between gap-4"><div><h2 className="text-xl font-semibold">{text.heading}</h2><p className="mt-1 text-sm text-muted-foreground">{text.intro}</p></div><button type="button" onClick={onClose} aria-label={text.close} className="p-1"><X className="size-5" /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">{text.course}<select required value={courseId} onChange={(event) => changeCourse(event.target.value)} className={field}>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">{text.title}<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className={field} /></label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">{text.description}<textarea maxLength={4000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="border border-input bg-background px-3 py-2 text-sm" /></label>
        <label className="grid gap-2 text-sm font-medium">{text.starts}<input required type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className={field} /></label>
        <label className="grid gap-2 text-sm font-medium">{text.ends}<input required type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className={field} /></label>
        <label className="grid gap-2 text-sm font-medium">{text.duration}<input required min={1} type="number" value={duration} onChange={(event) => setDuration(Number(event.target.value))} className={field} /></label>
      </div>
      <ExaminationQuestionSelector key={courseId} banks={availableBanks} value={selection} onChange={setSelection} onError={setError} />
      <ExaminationSecurityFields value={security} onChange={setSecurity} shuffleQuestions={shuffleQuestions} onShuffleChange={setShuffleQuestions} showScore={showScore} onShowScoreChange={setShowScore} />
      {error ? <p role="alert" className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 border border-border px-4 text-sm font-medium">{text.cancel}</button><button disabled={busy} className="h-10 bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? text.creating : text.create}</button></div>
    </form>
  </div>;
}
