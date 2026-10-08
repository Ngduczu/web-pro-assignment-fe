import type { ApiTransport } from "@/lib/api/transport";
import type { CreateExerciseRequest, ExerciseDto, GradeSubmissionRequest, PaginatedResponse, SubmissionDto, SubmissionQuery, UpdateExerciseRequest } from "@/types/api";

function fileBody(file: File) {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export function createAssignmentsApi(request: ApiTransport) {
  return {
    createExercise: (courseId: string, body: CreateExerciseRequest) => request<ExerciseDto>(`/courses/${courseId}/exercises`, { method: "POST", body }),
    listExercises: (courseId: string) => request<ExerciseDto[]>(`/courses/${courseId}/exercises`),
    getExercise: (exerciseId: string) => request<ExerciseDto>(`/exercises/${exerciseId}`),
    updateExercise: (exerciseId: string, body: UpdateExerciseRequest) => request<ExerciseDto>(`/exercises/${exerciseId}`, { method: "PUT", body }),
    removeExercise: (exerciseId: string) => request<void>(`/exercises/${exerciseId}`, { method: "DELETE" }),
    uploadAttachment: (exerciseId: string, file: File) => request<ExerciseDto>(`/exercises/${exerciseId}/attachment`, { method: "POST", body: fileBody(file) }),
    getAttachment: (exerciseId: string, download = false) => request<Blob>(`/exercises/${exerciseId}/attachment`, { query: { download } }),
    publish: (exerciseId: string) => request<ExerciseDto>(`/exercises/${exerciseId}/publish`, { method: "POST" }),
    close: (exerciseId: string) => request<ExerciseDto>(`/exercises/${exerciseId}/close`, { method: "POST" }),
    uploadSubmission: (exerciseId: string, file: File) => request<SubmissionDto>(`/exercises/${exerciseId}/submissions`, { method: "POST", body: fileBody(file) }),
    getMySubmission: (exerciseId: string) => request<SubmissionDto>(`/exercises/${exerciseId}/my-submission`),
    listSubmissions: (exerciseId: string, query?: SubmissionQuery) => request<PaginatedResponse<SubmissionDto>>(`/exercises/${exerciseId}/submissions`, { query }),
    getSubmissionContent: (submissionId: string, download = false) => request<Blob>(`/submissions/${submissionId}/content`, { query: { download } }),
    submit: (submissionId: string) => request<SubmissionDto>(`/submissions/${submissionId}/submit`, { method: "POST" }),
    unsubmit: (submissionId: string) => request<SubmissionDto>(`/submissions/${submissionId}/unsubmit`, { method: "POST" }),
    grade: (submissionId: string, body: GradeSubmissionRequest) => request<SubmissionDto>(`/submissions/${submissionId}/grade`, { method: "PUT", body }),
  };
}

export type AssignmentsApi = ReturnType<typeof createAssignmentsApi>;
