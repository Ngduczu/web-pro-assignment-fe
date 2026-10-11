"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { EnrollmentDto, SubmissionDto } from "@/types/api";
import { TeacherEnrollmentsQueue } from "@/components/teacher/teacher-enrollments-queue";
import { AlertBanner, EmptyState, ListRow } from "@/components/ui/page-chrome";
import { PaginatedChildren } from "@/components/ui/paginated-list";

type PendingEnrollmentItem = { courseName: string; courseId: string; enrollment: EnrollmentDto };
type PendingSubmissionItem = {
  courseName: string;
  courseId: string;
  exerciseId: string;
  exerciseTitle: string;
  submission: SubmissionDto;
};

const copy = {
  en: {
    tabs: "Course work queues",
    enrollments: "Pending enrollment requests",
    submissions: "Assignments to grade",
    incompleteEnrollments: "Some enrollment data could not be loaded. This list may be incomplete.",
    incompleteSubmissions: "Some assignment data could not be loaded. This list may be incomplete.",
    noSubmissions: "No assignments are waiting to be graded.",
    student: "Student",
    review: "Review submission",
  },
  vi: {
    tabs: "Danh sách công việc khóa học",
    enrollments: "Đơn xin vào lớp đang chờ duyệt",
    submissions: "Bài tập chưa chấm",
    incompleteEnrollments: "Không thể tải một số dữ liệu đăng ký. Danh sách có thể chưa đầy đủ.",
    incompleteSubmissions: "Không thể tải một số dữ liệu bài tập. Danh sách có thể chưa đầy đủ.",
    noSubmissions: "Không có bài tập nào đang chờ chấm.",
    student: "Học viên",
    review: "Xem bài nộp",
  },
};

export function TeacherDashboardWorkTabs({
  initialEnrollments,
  initialSubmissions,
  enrollmentDataIncomplete,
  submissionDataIncomplete,
}: {
  initialEnrollments: PendingEnrollmentItem[];
  initialSubmissions: PendingSubmissionItem[];
  enrollmentDataIncomplete: boolean;
  submissionDataIncomplete: boolean;
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [activeTab, setActiveTab] = useState<"enrollments" | "submissions">("enrollments");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-2" aria-label={text.tabs}>
        <button
          type="button"
          aria-pressed={activeTab === "enrollments"}
          onClick={() => setActiveTab("enrollments")}
          className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${activeTab === "enrollments" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <span>{text.enrollments}</span>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums">{initialEnrollments.length}</span>
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "submissions"}
          onClick={() => setActiveTab("submissions")}
          className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${activeTab === "submissions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <span>{text.submissions}</span>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums">{initialSubmissions.length}</span>
        </button>
      </div>

      {activeTab === "enrollments" ? (
        <div className="space-y-3">
          {enrollmentDataIncomplete ? <AlertBanner tone="warning">{text.incompleteEnrollments}</AlertBanner> : null}
          <TeacherEnrollmentsQueue initialEnrollments={initialEnrollments} />
        </div>
      ) : (
        <div className="space-y-3">
          {submissionDataIncomplete ? <AlertBanner tone="warning">{text.incompleteSubmissions}</AlertBanner> : null}
          {!initialSubmissions.length ? (
            <EmptyState>{text.noSubmissions}</EmptyState>
          ) : (
            <PaginatedChildren listClassName="divide-y divide-border">
              {initialSubmissions.map(({ courseName, courseId, exerciseId, exerciseTitle, submission }) => {
                const submittedAt = submission.submittedAt ?? submission.createdAt;
                const submittedDate = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(submittedAt));

                return (
                  <ListRow key={submission.id} href={`/courses/${courseId}/exercises/${exerciseId}`}>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{courseName}</p>
                      <p className="truncate font-medium">{exerciseTitle}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {submission.student?.fullName ?? text.student} · {submittedDate}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-primary">{text.review}</span>
                  </ListRow>
                );
              })}
            </PaginatedChildren>
          )}
        </div>
      )}
    </div>
  );
}