"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { CourseStatus, EnrollmentDto } from "@/types/api";

export function CourseEnrollmentAction({ courseId, enrollment, courseStatus }: { courseId: string; enrollment?: EnrollmentDto; courseStatus: CourseStatus }) {
  const [currentEnrollment, setCurrentEnrollment] = useState(enrollment);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();

  async function requestEnrollment() {
    setIsPending(true);
    setError(undefined);
    try {
      setCurrentEnrollment(await clientApis.enrollments.request(courseId));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to request enrollment.");
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
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to cancel enrollment.");
    } finally {
      setIsPending(false);
    }
  }

  if (currentEnrollment?.status === "Accepted") return <span className="text-sm font-medium text-emerald-700">Enrolled</span>;
  if (currentEnrollment?.status === "Waiting") return <button type="button" onClick={cancelEnrollment} disabled={isPending} className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">{isPending ? "Cancelling..." : "Cancel request"}</button>;
  if (courseStatus !== "Open") return <span className="text-sm text-muted-foreground">Enrollment closed</span>;
  return <div className="flex flex-col items-end gap-1"><button type="button" onClick={requestEnrollment} disabled={isPending} className="border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{isPending ? "Requesting..." : "Join course"}</button>{error ? <span className="max-w-44 text-right text-xs text-destructive">{error}</span> : null}</div>;
}