"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw, Trash2, Pencil } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { AddStudentResultStatus, CourseDto, EnrollmentDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";
import { FieldError, RequiredMark, ValidatedForm } from "@/components/ui/form-field-feedback";
import { PaginatedChildren } from "@/components/ui/paginated-list";
import { AreaRefreshButton } from "@/components/ui/area-refresh-button";

const copy = {
  en: {
    managementTitle: "Course settings",
    managementDescription: "Refresh or update this course and its enrollment configuration.",
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
    requests: "Course members",
    requestDescription: "Manage approved students and review pending enrollment requests.",
    enrollmentTabs: "Course enrollment groups",
    approvedTab: "Approved",
    waitingTab: "Pending approval",
    approvedEmpty: "No students have been approved yet.",
    waitingEmpty: "No enrollment requests are waiting for approval.",
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
    addTitle: "Add students by email",
    addDescription: "Enter student emails separated by commas, spaces or new lines. Added students are accepted immediately.",
    addPlaceholder: "student1@example.com\nstudent2@example.com",
    addSubmit: "Add students",
    adding: "Adding...",
    addEmpty: "Enter at least one email.",
    addTooMany: "You can add up to 100 emails at a time.",
    addError: "Unable to add students.",
    addResultTitle: "Result",
    addStatus: {
      Added: "Added",
      AlreadyAccepted: "Already in this course",
      InvalidEmail: "Invalid email",
      NotFound: "No account with this email",
      NotStudent: "Account is not a student",
      Inactive: "Account is not active",
      CourseFull: "Course is full",
    } satisfies Record<AddStudentResultStatus, string>,
    refresh: "Refresh course and enrollments", refreshing: "Refreshing...", refreshError: "Unable to refresh course data.",
  },
  vi: {
    managementTitle: "Thiết lập khóa học",
    managementDescription: "Làm mới hoặc cập nhật khóa học và cấu hình đăng ký.",
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
    requests: "Thành viên khóa học",
    requestDescription: "Quản lý học viên đã được duyệt và các yêu cầu đang chờ xử lý.",
    enrollmentTabs: "Nhóm thành viên khóa học",
    approvedTab: "Đã duyệt",
    waitingTab: "Chờ duyệt",
    approvedEmpty: "Chưa có học viên nào được duyệt.",
    waitingEmpty: "Không có yêu cầu tham gia nào đang chờ duyệt.",
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
    addTitle: "Thêm học viên bằng email",
    addDescription: "Nhập email học viên, cách nhau bằng dấu phẩy, khoảng trắng hoặc xuống dòng. Học viên được thêm sẽ vào khóa học ngay.",
    addPlaceholder: "hocvien1@example.com\nhocvien2@example.com",
    addSubmit: "Thêm học viên",
    adding: "Đang thêm...",
    addEmpty: "Hãy nhập ít nhất một email.",
    addTooMany: "Chỉ thêm tối đa 100 email mỗi lần.",
    addError: "Không thể thêm học viên.",
    addResultTitle: "Kết quả",
    addStatus: {
      Added: "Đã thêm",
      AlreadyAccepted: "Đã ở trong khóa học",
      InvalidEmail: "Email không hợp lệ",
      NotFound: "Không có tài khoản với email này",
      NotStudent: "Tài khoản không phải học viên",
      Inactive: "Tài khoản chưa hoạt động",
      CourseFull: "Khóa học đã đủ học viên",
    } satisfies Record<AddStudentResultStatus, string>,
    refresh: "Làm mới khóa học và đăng ký", refreshing: "Đang làm mới...", refreshError: "Không thể làm mới dữ liệu khóa học.",
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
  const [emailsText, setEmailsText] = useState("");
  const [addResults, setAddResults] = useState<{ email: string; status: AddStudentResultStatus }[]>();
  const [addError, setAddError] = useState<string>();
  const [enrollmentTab, setEnrollmentTab] = useState<"accepted" | "waiting">("waiting");

  const acceptedEnrollments = enrollments.filter((enrollment) => enrollment.status === "Accepted");
  const waitingEnrollments = enrollments.filter((enrollment) => enrollment.status === "Waiting");
  const visibleEnrollments = enrollmentTab === "accepted" ? acceptedEnrollments : waitingEnrollments;

  async function addStudents(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emails = [...new Set(emailsText.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean))];
    setAddError(undefined);
    setAddResults(undefined);
    if (!emails.length) return setAddError(text.addEmpty);
    if (emails.length > 100) return setAddError(text.addTooMany);
    setPending(true);
    try {
      const results = await clientApis.enrollments.addByEmail(course.id, { emails });
      setAddResults(results);
      setEmailsText(results.filter((item) => item.status !== "Added" && item.status !== "AlreadyAccepted").map((item) => item.email).join("\n"));
      await refreshCourseData();
    } catch (caught) {
      setAddError(language === "en" && caught instanceof ApiError ? caught.detail : text.addError);
    } finally {
      setPending(false);
    }
  }

  async function refreshCourseData() {
    setError(undefined);
    try {
      const [latestCourse, latestEnrollments] = await Promise.all([
        clientApis.courses.get(course.id, Boolean(course.deletedAt)),
        clientApis.enrollments.listByCourse(course.id, { pageSize: 20 }).then((result) => result.items),
      ]);
      setCourse(latestCourse);
      setEnrollments(latestEnrollments);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.refreshError);
    }
  }

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{text.managementTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{text.managementDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
        <AreaRefreshButton label={text.refresh} loadingLabel={text.refreshing} onRefresh={refreshCourseData} disabled={pending || editing} />
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
      </div>

      {editing ? (
        <ValidatedForm onSubmit={saveCourse} className="mt-5 max-w-2xl space-y-4 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
          <div className="space-y-2"><label htmlFor="edit-course-name" className="text-sm font-medium">{text.courseName}<RequiredMark /></label><input
            id="edit-course-name"
            required
            data-field-error="edit-course-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          /><FieldError field="edit-course-name" /></div>
          <div className="space-y-2"><label htmlFor="edit-course-description" className="text-sm font-medium">{text.description}</label><textarea
            id="edit-course-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="edit-course-capacity" className="text-sm font-medium">{text.capacity}<RequiredMark /></label><input
              id="edit-course-capacity"
              required
              data-field-error="edit-course-capacity"
              min="1"
              type="number"
              value={maxStudents}
              onChange={(event) => setMaxStudents(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            /><FieldError field="edit-course-capacity" /></div>
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
        </ValidatedForm>
      ) : null}
      </section>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <section className="max-w-4xl space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <h2 className="text-lg font-semibold">{text.requests}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{text.requestDescription}</p>
        </div>
        {!course.deletedAt && course.status === "Open" ? (
          <form onSubmit={addStudents} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div>
              <h3 className="font-medium">{text.addTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text.addDescription}</p>
            </div>
            <textarea
              value={emailsText}
              onChange={(event) => setEmailsText(event.target.value)}
              rows={3}
              aria-label={text.addTitle}
              placeholder={text.addPlaceholder}
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            {addError ? <p role="alert" className="text-sm text-destructive">{addError}</p> : null}
            {addResults ? (
              <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-background text-sm" aria-label={text.addResultTitle}>
                {addResults.map((item) => (
                  <li key={item.email} className="flex flex-col gap-1 p-2.5 sm:flex-row sm:justify-between">
                    <span className="break-all">{item.email}</span>
                    <span className={item.status === "Added" || item.status === "AlreadyAccepted" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>{text.addStatus[item.status]}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? text.adding : text.addSubmit}
            </button>
          </form>
        ) : null}
        <div className="flex gap-2 overflow-x-auto border-b border-border pb-2" aria-label={text.enrollmentTabs}>
          <button
            type="button"
            aria-pressed={enrollmentTab === "accepted"}
            onClick={() => setEnrollmentTab("accepted")}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${enrollmentTab === "accepted" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <span>{text.approvedTab}</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums">{acceptedEnrollments.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={enrollmentTab === "waiting"}
            onClick={() => setEnrollmentTab("waiting")}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${enrollmentTab === "waiting" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <span>{text.waitingTab}</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums">{waitingEnrollments.length}</span>
          </button>
        </div>
        {!visibleEnrollments.length ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
            {enrollmentTab === "accepted" ? text.approvedEmpty : text.waitingEmpty}
          </p>
        ) : (
          <PaginatedChildren listClassName="space-y-2" resetKey={enrollmentTab}>
            {visibleEnrollments.map((enrollment) => (
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
          </PaginatedChildren>
        )}
      </section>
    </div>
  );
}
