import type { ApiTransport } from "@/lib/api/transport";
import type { CreateExaminationRequest, ExaminationAttemptDto, ExaminationAttemptQuery, ExaminationAttemptResultDto, ExaminationDto, ExaminationSubmitReason, ExaminationViolationType, PaginatedResponse, StudentAnswerDto, StudentExamQuestionDto, StudentExaminationDto, StudentFillInBlankAnswerInput, UpdateExaminationRequest } from "@/types/api";

export function createExaminationsApi(request: ApiTransport) {
  return {
    create: (courseId: string, body: CreateExaminationRequest) => request<ExaminationDto>(`/courses/${courseId}/examinations`, { method: "POST", body }),
    listByCourse: (courseId: string) => request<ExaminationDto[]>(`/courses/${courseId}/examinations`),
    listAvailable: (courseId: string) => request<StudentExaminationDto[]>(`/courses/${courseId}/examinations/available`),
    get: (examinationId: string) => request<ExaminationDto>(`/examinations/${examinationId}`),
    getForStudent: (examinationId: string) => request<StudentExaminationDto>(`/examinations/${examinationId}/student`),
    update: (examinationId: string, body: UpdateExaminationRequest) => request<ExaminationDto>(`/examinations/${examinationId}`, { method: "PUT", body }),
    publish: (examinationId: string) => request<ExaminationDto>(`/examinations/${examinationId}/publish`, { method: "POST" }),
    close: (examinationId: string) => request<ExaminationDto>(`/examinations/${examinationId}/close`, { method: "POST" }),
    getMyAttempt: (examinationId: string) => request<ExaminationAttemptDto>(`/examinations/${examinationId}/my-attempt`),
    listAttempts: (examinationId: string, query?: ExaminationAttemptQuery) => request<PaginatedResponse<ExaminationAttemptResultDto>>(`/examinations/${examinationId}/attempts`, { query }),
    startAttempt: (examinationId: string) => request<ExaminationAttemptDto>(`/examination-attempts/${examinationId}/start`, { method: "POST" }),
    getQuestions: (attemptId: string) => request<StudentExamQuestionDto[]>(`/examination-attempts/${attemptId}/questions`),
    saveMultipleChoice: (attemptId: string, questionId: string, selectedOptionId: string) => request<StudentAnswerDto>(`/examination-attempts/${attemptId}/questions/${questionId}/multiple-choice`, { method: "PUT", query: { selectedOptionId } }),
    saveFillInBlank: (attemptId: string, questionId: string, answers: StudentFillInBlankAnswerInput[]) => request<StudentAnswerDto>(`/examination-attempts/${attemptId}/questions/${questionId}/fill-in-blank`, { method: "PUT", body: answers }),
    disconnect: (attemptId: string) => request<ExaminationAttemptDto>(`/examination-attempts/${attemptId}/disconnect`, { method: "POST" }),
    reconnect: (attemptId: string) => request<ExaminationAttemptDto>(`/examination-attempts/${attemptId}/reconnect`, { method: "POST" }),
    recordViolation: (attemptId: string, violationType: ExaminationViolationType, durationSeconds?: number) => request<ExaminationAttemptDto>(`/examination-attempts/${attemptId}/violations`, { method: "POST", query: { violationType, durationSeconds } }),
    submitAttempt: (attemptId: string) => request<ExaminationAttemptDto>(`/examination-attempts/${attemptId}/submit`, { method: "POST" }),
    autoSubmit: (attemptId: string, reason: ExaminationSubmitReason) => request<ExaminationAttemptDto>(`/examination-attempts/${attemptId}/auto-submit`, { method: "POST", query: { reason } }),
  };
}

export type ExaminationsApi = ReturnType<typeof createExaminationsApi>;
