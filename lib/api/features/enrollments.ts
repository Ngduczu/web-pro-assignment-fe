import type { ApiTransport } from "@/lib/api/transport";
import type { EnrollmentDto, EnrollmentQuery, PaginatedResponse } from "@/types/api";

export function createEnrollmentsApi(request: ApiTransport) {
  return {
    request: (courseId: string) => request<EnrollmentDto>(`/courses/${courseId}/enrollments`, { method: "POST" }),
    listByCourse: (courseId: string, query?: EnrollmentQuery) => request<PaginatedResponse<EnrollmentDto>>(`/courses/${courseId}/enrollments`, { query }),
    listMine: () => request<EnrollmentDto[]>("/enrollments/mine"),
    accept: (enrollmentId: string) => request<EnrollmentDto>(`/enrollments/${enrollmentId}/accept`, { method: "POST" }),
    reject: (enrollmentId: string) => request<EnrollmentDto>(`/enrollments/${enrollmentId}/reject`, { method: "POST" }),
    cancel: (enrollmentId: string) => request<EnrollmentDto>(`/enrollments/${enrollmentId}/cancel`, { method: "POST" }),
    revoke: (enrollmentId: string) => request<EnrollmentDto>(`/enrollments/${enrollmentId}/revoke`, { method: "POST" }),
  };
}

export type EnrollmentsApi = ReturnType<typeof createEnrollmentsApi>;
