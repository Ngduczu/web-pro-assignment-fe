import type { ApiTransport } from "@/lib/api/transport";
import type { CourseDto, CourseQuery, CreateCourseRequest, PaginatedResponse, UpdateCourseRequest } from "@/types/api";

export function createCoursesApi(request: ApiTransport) {
  return {
    list: (query?: CourseQuery) => request<PaginatedResponse<CourseDto>>("/courses", { query }),
    listMine: () => request<CourseDto[]>("/courses/mine"),
    get: (courseId: string, includeDeleted = false) => request<CourseDto>(`/courses/${courseId}`, { query: { includeDeleted } }),
    create: (body: CreateCourseRequest) => request<CourseDto>("/courses", { method: "POST", body }),
    update: (courseId: string, body: UpdateCourseRequest) => request<CourseDto>(`/courses/${courseId}`, { method: "PUT", body }),
    remove: (courseId: string) => request<void>(`/courses/${courseId}`, { method: "DELETE" }),
    restore: (courseId: string) => request<CourseDto>(`/courses/${courseId}/restore`, { method: "POST" }),
  };
}

export type CoursesApi = ReturnType<typeof createCoursesApi>;
