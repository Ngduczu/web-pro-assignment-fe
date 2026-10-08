import type { ApiTransport } from "@/lib/api/transport";
import type { CreateFillInBlankQuestionRequest, CreateMultipleChoiceQuestionRequest, CreateQuestionBankRequest, QuestionBankDto, QuestionDto, UpdateQuestionBankRequest, UpdateQuestionRequest } from "@/types/api";

export function createQuestionsApi(request: ApiTransport) {
  return {
    createBank: (body: CreateQuestionBankRequest) => request<QuestionBankDto>("/question-banks", { method: "POST", body }),
    updateBank: (bankId: string, body: UpdateQuestionBankRequest) => request<QuestionBankDto>(`/question-banks/${bankId}`, { method: "PUT", body }),
    removeBank: (bankId: string) => request<void>(`/question-banks/${bankId}`, { method: "DELETE" }),
    listBanks: (teacherId?: string) => request<QuestionBankDto[]>("/question-banks", { query: { teacherId } }),
    createMultipleChoice: (bankId: string, body: CreateMultipleChoiceQuestionRequest) => request<QuestionDto>(`/question-banks/${bankId}/multiple-choice`, { method: "POST", body }),
    createFillInBlank: (bankId: string, body: CreateFillInBlankQuestionRequest) => request<QuestionDto>(`/question-banks/${bankId}/fill-in-blank`, { method: "POST", body }),
    listQuestions: (bankId: string) => request<QuestionDto[]>(`/question-banks/${bankId}/questions`),
    updateQuestion: (questionId: string, body: UpdateQuestionRequest) => request<QuestionDto>(`/questions/${questionId}`, { method: "PUT", body }),
    removeQuestion: (questionId: string) => request<void>(`/questions/${questionId}`, { method: "DELETE" }),
  };
}

export type QuestionsApi = ReturnType<typeof createQuestionsApi>;
