import type { ApiTransport } from "@/lib/api/transport";
import type { CreateLessonRequest, LessonDto, MaterialDto, UpdateLessonRequest } from "@/types/api";

function fileBody(file: File) {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export function createLessonsApi(request: ApiTransport) {
  return {
    create: (courseId: string, body: CreateLessonRequest) => request<LessonDto>(`/courses/${courseId}/lessons`, { method: "POST", body }),
    list: (courseId: string) => request<LessonDto[]>(`/courses/${courseId}/lessons`),
    get: (lessonId: string) => request<LessonDto>(`/lessons/${lessonId}`),
    update: (lessonId: string, body: UpdateLessonRequest) => request<LessonDto>(`/lessons/${lessonId}`, { method: "PUT", body }),
    remove: (lessonId: string) => request<void>(`/lessons/${lessonId}`, { method: "DELETE" }),
    listMaterials: (lessonId: string) => request<MaterialDto[]>(`/lessons/${lessonId}/materials`),
    uploadMaterial: (lessonId: string, file: File) => request<MaterialDto>(`/lessons/${lessonId}/materials`, { method: "POST", body: fileBody(file) }),
    getMaterialContent: (materialId: string, download = false) => request<Blob>(`/materials/${materialId}/content`, { query: { download } }),
    removeMaterial: (materialId: string) => request<void>(`/materials/${materialId}`, { method: "DELETE" }),
  };
}

export type LessonsApi = ReturnType<typeof createLessonsApi>;
