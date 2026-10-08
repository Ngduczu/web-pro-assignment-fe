import { clientRequest } from "@/lib/api/client";
import { createAssignmentsApi } from "@/lib/api/features/assignments";
import { createAuthApi } from "@/lib/api/features/auth";
import { createChatApi } from "@/lib/api/features/chat";
import { createCoursesApi } from "@/lib/api/features/courses";
import { createEnrollmentsApi } from "@/lib/api/features/enrollments";
import { createExaminationsApi } from "@/lib/api/features/examinations";
import { createLessonsApi } from "@/lib/api/features/lessons";
import { createQuestionsApi } from "@/lib/api/features/questions";
import { createUsersApi } from "@/lib/api/features/users";

export const clientApis = {
  auth: createAuthApi(clientRequest),
  users: createUsersApi(clientRequest),
  courses: createCoursesApi(clientRequest),
  enrollments: createEnrollmentsApi(clientRequest),
  lessons: createLessonsApi(clientRequest),
  assignments: createAssignmentsApi(clientRequest),
  questions: createQuestionsApi(clientRequest),
  examinations: createExaminationsApi(clientRequest),
  chat: createChatApi(clientRequest),
};