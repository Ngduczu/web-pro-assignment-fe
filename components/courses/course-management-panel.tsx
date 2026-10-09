"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw, Trash2, Pencil } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { CourseDto, EnrollmentDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: {
    closeEditor: "Close editor",
    edit: "Edit course",
    courseName: "Course name",
    description: "Description",
    capacity: "Maximum students",
    courseStatus: "Enrollment status",
    remove: "Delete course",
    removeConfirm: "Delete this course? It will be soft-deleted and hidden from active views.",
    restore: "Restore course",
    restoreSuccess: "Course restored successfully.",
    deletedBanner: "This course has been soft-deleted. Students cannot access it until restored.",
    save: "Save changes",
    saving: "Saving...",
    restoring: "Restoring...",
    requests: "Enrollment requests",
    requestDescription: "Review students requesting access to this course.",
    empty: "No enrollment records yet.",
    student: "Student",
    accept: "Accept",
    reject: "Reject",
    revoke: "Revoke",
    open: "Open",
    closed: "Closed",
    waiting: "Waiting",
    accepted: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
    updateError: "Unable to update course.",
    deleteError: "Unable to delete course.",
    restoreError: "Unable to restore course.",
    enrollmentError: "Unable to update enrollment.",
  },
  vi: {
    closeEditor: "Đóng trình chỉnh sửa",
    edit: "Chỉnh sửa khóa học",
    courseName: "Tên khóa học",
    description: "Mô tả",
    capacity: "Số học viên tối đa",
    courseStatus: "Trạng thái đăng ký",
    remove: "Xóa khóa học",
    removeConfirm: "Xóa khóa học này? Khóa học sẽ được xóa mềm và ẩn khỏi danh sách chính.",
    restore: "Khôi phục khóa học",
    restoreSuccess: "Khôi phục khóa học thành công.",
    deletedBanner: "Khóa học này đang ở trạng thái đã xóa mềm. Học viên không thể truy cập cho đến khi được khôi phục.",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
    restoring: "Đang khôi phục...",
    requests: "Yêu cầu đăng ký",
    requestDescription: "Duyệt học viên đang yêu cầu tham gia khóa học.",
    empty: "Chưa có bản ghi đăng ký nào.",
    student: "Học viên",
    accept: "Chấp nhận",
    reject: "Từ chối",
    revoke: "Thu hồi",
    open: "Đang mở",
    closed: "Đã đóng",
    waiting: "Đang chờ",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
    updateError: "Không thể cập nhật khóa học.",
    deleteError: "Không thể xóa khóa học.",
    restoreError: "Không thể khôi phục khóa học.",
    enrollmentError: "Không thể cập nhật đăng ký.",
  },
};

export function CourseManagementPanel({
  course: initialCourse,
  enrollments: initialEnrollments,
}: {
  course: CourseDto;
  enrollments: EnrollmentDto[];
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [course, setCourse] = useState(initialCourse);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialCourse.name);
  const [description, setDescription] = useState(initialCourse.description ?? "");
  const [maxStudents, setMaxStudents] = useState(String(initialCourse.maxStudents));
  const [status, setStatus] = useState(initialCourse.status);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const statusLabel = (value: EnrollmentDto["status"]) =>
    ({
      Waiting: text.waiting,
      Accepted: text.accepted,
      Rejected: text.rejected,
      Cancelled: text.cancelled,
    })[value];

  async function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const updated = await clientApis.courses.update(course.id, {
        name,
        description: description || null,
        maxStudents: Number(maxStudents),
        status,
      });
      setCourse(updated);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.updateError);
    } finally {
      setPending(false);
    }
  }

  async function removeCourse() {
    if (!window.confirm(text.removeConfirm)) return;
    setPending(true);
    setError(undefined);
    try {
      await clientApis.courses.remove(course.id);
      router.push("/courses");
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.deleteError);
      setPending(false);
    }
  }

  async function restoreCourse() {
    setPending(true);
    setError(undefined);
    try {
      const restored = await clientApis.courses.restore(course.id);
      setCourse(restored);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.restoreError);
    } finally {
      setPending(false);
    }
  }

  async function transition(enrollment: EnrollmentDto, action: "accept" | "reject" | "revoke") {
    setPending(true);
    setError(undefined);
    try {
      const updated = await clientApis.enrollments[action](enrollment.id);
      setEnrollments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.enrollmentError);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {course.deletedAt ? (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{text.deletedBanner}</p>
          <button
            type="button"
            onClick={restoreCourse}
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-600/40 bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" />
            {pending ? text.restoring : text.restore}
          </button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary/35 hover:bg-muted"
        >
          <Pencil className="size-4" />
          {editing ? text.closeEditor : text.edit}
        </button>
        {!course.deletedAt ? (
          <button
            type="button"
            onClick={removeCourse}
            disabled={pending}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-destructive/30 bg-background px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {text.remove}
          </button>
        ) : (
          <button
            type="button"
            onClick={restoreCourse}
            disabled={pending}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          >
            <RotateCcw className="size-4" />
            {text.restore}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={saveCourse} className="mt-5 max-w-2xl space-y-4 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
          <div className="space-y-2"><label htmlFor="edit-course-name" className="text-sm font-medium">{text.courseName}</label><input
            id="edit-course-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          /></div>
          <div className="space-y-2"><label htmlFor="edit-course-description" className="text-sm font-medium">{text.description}</label><textarea
            id="edit-course-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="edit-course-capacity" className="text-sm font-medium">{text.capacity}</label><input
              id="edit-course-capacity"
              required
              min="1"
              type="number"
              value={maxStudents}
              onChange={(event) => setMaxStudents(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            /></div>
            <div className="space-y-2"><label htmlFor="edit-course-status" className="text-sm font-medium">{text.courseStatus}</label><select
              id="edit-course-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CourseDto["status"])}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="Open">{text.open}</option>
              <option value="Closed">{text.closed}</option>
            </select></div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? text.saving : text.save}
          </button>
        </form>
      ) : null}
      </section>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <section className="max-w-4xl space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <h2 className="text-lg font-semibold">{text.requests}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{text.requestDescription}</p>
        </div>
        {!enrollments.length ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">{text.empty}</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{enrollment.student?.fullName ?? enrollment.studentId}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {enrollment.student?.email ?? text.student} · <span className="font-medium text-foreground">{statusLabel(enrollment.status)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enrollment.status === "Waiting" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => transition(enrollment, "accept")}
                        disabled={pending}
                        className="min-h-10 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                      >
                        {text.accept}
                      </button>
                      <button
                        type="button"
                        onClick={() => transition(enrollment, "reject")}
                        disabled={pending}
                        className="min-h-10 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                      >
                        {text.reject}
                      </button>
                    </>
                  ) : null}
                  {enrollment.status === "Accepted" ? (
                    <button
                      type="button"
                      onClick={() => transition(enrollment, "revoke")}
                      disabled={pending}
                      className="min-h-10 rounded-lg border border-destructive/30 px-3.5 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
                    >
                      {text.revoke}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
