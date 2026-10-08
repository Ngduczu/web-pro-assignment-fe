"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { CourseStatus, EnrollmentDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: { enrolled: "Enrolled", cancelling: "Cancelling...", cancel: "Cancel request", closed: "Enrollment closed", requesting: "Requesting...", join: "Join course", requestError: "Unable to request enrollment.", cancelError: "Unable to cancel enrollment." },
  vi: { enrolled: "Đã tham gia", cancelling: "Đang hủy...", cancel: "Hủy yêu cầu", closed: "Đã đóng đăng ký", requesting: "Đang gửi...", join: "Đăng ký khóa học", requestError: "Không thể gửi yêu cầu đăng ký.", cancelError: "Không thể hủy yêu cầu đăng ký." },
};

export function CourseEnrollmentAction({ courseId, enrollment, courseStatus, compact = false }: { courseId: string; enrollment?: EnrollmentDto; courseStatus: CourseStatus; compact?: boolean }) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [currentEnrollment, setCurrentEnrollment] = useState(enrollment);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();

  async function requestEnrollment() {
    setIsPending(true);
    setError(undefined);
    try {
      setCurrentEnrollment(await clientApis.enrollments.request(courseId));
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.requestError);
    } finally {
      setIsPending(false);
    }
  }

  async function cancelEnrollment() {
    if (!currentEnrollment) return;
    setIsPending(true);
    setError(undefined);
    try {
      setCurrentEnrollment(await clientApis.enrollments.cancel(currentEnrollment.id));
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.cancelError);
    } finally {
      setIsPending(false);
    }
  }

  if (currentEnrollment?.status === "Accepted") return <span className="text-sm font-medium text-emerald-700">{text.enrolled}</span>;
  if (currentEnrollment?.status === "Waiting") return <button type="button" onClick={cancelEnrollment} disabled={isPending} className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">{isPending ? text.cancelling : text.cancel}</button>;
  if (courseStatus !== "Open") return <span className="text-sm text-muted-foreground">{text.closed}</span>;
  return <div className={`flex flex-col gap-1 ${compact ? "items-end" : "items-start"}`}><button type="button" onClick={requestEnrollment} disabled={isPending} className={`${compact ? "border border-border px-3 py-1.5" : "bg-primary px-5 py-2.5 text-primary-foreground"} text-sm font-semibold hover:opacity-90 disabled:opacity-50`}>{isPending ? text.requesting : text.join}</button>{error ? <span className={`${compact ? "max-w-44 text-right" : "max-w-md"} text-xs text-destructive`}>{error}</span> : null}</div>;
}
