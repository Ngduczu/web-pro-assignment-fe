"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: { heading: "New lesson", intro: "Add learning content and materials directly to this course.", name: "Lesson name", content: "Content", order: "Order", status: "Initial status", draft: "Draft", published: "Published", files: "Materials", chooseFiles: "Choose files", fileHint: "You can attach multiple files, up to 20 MB each.", removeFile: "Remove file", cancel: "Cancel", creating: "Creating and uploading...", create: "Create lesson", failure: "Unable to create lesson.", fileTooLarge: "Each material must be 20 MB or smaller.", partialFailure: "The lesson was created, but one or more files could not be uploaded. Open the lesson to retry.", openLesson: "Open lesson" },
  vi: { heading: "Bài học mới", intro: "Thêm nội dung và tài liệu trực tiếp vào khóa học.", name: "Tên bài học", content: "Nội dung", order: "Thứ tự", status: "Trạng thái ban đầu", draft: "Bản nháp", published: "Đã công bố", files: "Tài liệu", chooseFiles: "Chọn tệp", fileHint: "Có thể đính kèm nhiều tệp, tối đa 20 MB cho mỗi tệp.", removeFile: "Xóa tệp", cancel: "Hủy", creating: "Đang tạo và tải tệp...", create: "Tạo bài học", failure: "Không thể tạo bài học.", fileTooLarge: "Mỗi tài liệu không được vượt quá 20 MB.", partialFailure: "Bài học đã được tạo nhưng một hoặc nhiều tệp chưa tải lên được. Hãy mở bài học để thử lại.", openLesson: "Mở bài học" },
};

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonCreateDialog({ courseId, nextOrder, onClose, onCreated }: { courseId: string; nextOrder: number; onClose: () => void; onCreated: () => void }) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [files, setFiles] = useState<File[]>([]);
  const [createdLessonId, setCreatedLessonId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(undefined);
    try {
      const lesson = await clientApis.lessons.create(courseId, { name: name.trim(), content: content.trim() || null, order, status });
      const uploads = await Promise.allSettled(files.map((file) => clientApis.lessons.uploadMaterial(lesson.id, file)));
      if (uploads.some((result) => result.status === "rejected")) {
        setCreatedLessonId(lesson.id);
        setError(text.partialFailure);
      } else {
        onCreated();
      }
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.failure);
    } finally { setBusy(false); }
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.some((file) => file.size >= 20_000_000)) { setError(text.fileTooLarge); return; }
    setError(undefined);
    setFiles((current) => [...current, ...selected]);
  }

  function openCreatedLesson() {
    if (!createdLessonId) return;
    onCreated();
    router.push(`/courses/${courseId}/lessons/${createdLessonId}`);
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} aria-label={text.cancel} /><form onSubmit={submit} className="relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{text.heading}</h2><p className="mt-1 text-sm text-muted-foreground">{text.intro}</p></div><button type="button" onClick={onClose}><X className="size-5" /></button></div><fieldset disabled={Boolean(createdLessonId) || busy} className="mt-6 space-y-4 disabled:opacity-70"><label className="grid gap-2 text-sm font-medium">{text.name}<input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.content}<textarea rows={7} value={content} onChange={(event) => setContent(event.target.value)} className="border border-input bg-background px-3 py-2 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">{text.order}<input required min={1} type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.status}<select value={status} onChange={(event) => setStatus(event.target.value as "Draft" | "Published")} className="h-10 border border-input bg-background px-3 font-normal"><option value="Draft">{text.draft}</option><option value="Published">{text.published}</option></select></label></div><div className="space-y-3"><div><p className="text-sm font-medium">{text.files}</p><p className="mt-1 text-xs text-muted-foreground">{text.fileHint}</p></div><label className="inline-flex cursor-pointer border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><input type="file" multiple className="sr-only" onChange={selectFiles} />{text.chooseFiles}</label>{files.length ? <div className="divide-y divide-border border-y border-border">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 py-3"><FileText className="size-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{fileSize(file.size)}</p></div><button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-medium text-destructive">{text.removeFile}</button></div>)}</div> : null}</div></fieldset>{error ? <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 border border-border px-4 text-sm font-medium">{text.cancel}</button>{createdLessonId ? <button type="button" onClick={openCreatedLesson} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground">{text.openLesson}</button> : <button disabled={busy} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? text.creating : text.create}</button>}</div></form></div>;
}
