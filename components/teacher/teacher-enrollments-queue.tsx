"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { EnrollmentDto } from "@/types/api";
import { DividedList, EmptyState, ListRow } from "@/components/ui/page-chrome";

type TeacherEnrollmentsQueueProps = {
  initialEnrollments: { courseName: string; courseId: string; enrollment: EnrollmentDto }[];
};

export function TeacherEnrollmentsQueue({ initialEnrollments }: TeacherEnrollmentsQueueProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [items, setItems] = useState(initialEnrollments);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();
  const isVi = language === "vi";

  async function handleAction(enrollmentId: string, action: "accept" | "reject") {
    setBusyId(enrollmentId);
    setError(undefined);
    try {
      if (action === "accept") {
        await clientApis.enrollments.accept(enrollmentId);
      } else {
        await clientApis.enrollments.reject(enrollmentId);
      }
      setItems((prev) => prev.filter((item) => item.enrollment.id !== enrollmentId));
      router.refresh();
    } catch (caught) {
      setError(
        language === "en" && caught instanceof ApiError
          ? caught.detail
          : isVi
            ? "Không thể cập nhật yêu cầu đăng ký."
            : "Unable to update enrollment request.",
      );
    } finally {
      setBusyId(undefined);
    }
  }

  if (!items.length) {
    return (
      <EmptyState>
        {isVi ? "Không có yêu cầu đăng ký nào đang chờ duyệt." : "No pending enrollment requests."}
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      <DividedList>
        {items.map(({ courseName, enrollment }) => (
          <ListRow key={enrollment.id}>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{courseName}</p>
              <p className="truncate font-medium">{enrollment.student?.fullName || (isVi ? "Học viên" : "Student")}</p>
              <p className="truncate text-sm text-muted-foreground">{enrollment.student?.email || enrollment.studentId}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={busyId === enrollment.id}
                onClick={() => handleAction(enrollment.id, "accept")}
                className="h-8 border border-border px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                {isVi ? "Duyệt" : "Approve"}
              </button>
              <button
                type="button"
                disabled={busyId === enrollment.id}
                onClick={() => handleAction(enrollment.id, "reject")}
                className="h-8 border border-border px-3 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                {isVi ? "Từ chối" : "Reject"}
              </button>
            </div>
          </ListRow>
        ))}
      </DividedList>
    </div>
  );
}
