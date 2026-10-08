import "server-only";

import { serverRequest } from "@/lib/api/server-client";
import { createAssignmentsApi } from "@/lib/api/features/assignments";
import { createAuthApi } from "@/lib/api/features/auth";
import { createChatApi } from "@/lib/api/features/chat";
import { createCoursesApi } from "@/lib/api/features/courses";
import { createEnrollmentsApi } from "@/lib/api/features/enrollments";
import { createExaminationsApi } from "@/lib/api/features/examinations";
import { createLessonsApi } from "@/lib/api/features/lessons";
import { createQuestionsApi } from "@/lib/api/features/questions";
import { createUsersApi } from "@/lib/api/features/users";

export const serverApis = {
  auth: createAuthApi(serverRequest),
  users: createUsersApi(serverRequest),
  courses: createCoursesApi(serverRequest),
  enrollments: createEnrollmentsApi(serverRequest),
  lessons: createLessonsApi(serverRequest),
  assignments: createAssignmentsApi(serverRequest),
  questions: createQuestionsApi(serverRequest),
  examinations: createExaminationsApi(serverRequest),
  chat: createChatApi(serverRequest),
};