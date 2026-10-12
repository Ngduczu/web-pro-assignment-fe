# Bản đồ file frontend

Đối chiếu ngày 2026-10-13. Danh mục các file mã nguồn/cấu hình văn bản; không bao gồm dependency, build output, nội dung secret `.env`, assets nhị phân hoặc tài liệu lặp lại. Đây là chỉ mục truy vết, không khẳng định đã kiểm thử runtime từng file.

## .github/workflows

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [ci-deploy.yml](<../.github/workflows/ci-deploy.yml>) | Workflow CI kiểm tra và deploy trên main | — |

## app/(auth)/forgot-password

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(auth)/forgot-password/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `clientApis.auth.forgotPassword` |

## app/(auth)

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [layout.tsx](<../app/(auth)/layout.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |

## app/(auth)/login

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [layout.tsx](<../app/(auth)/login/layout.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `metadata` |
| [page.tsx](<../app/(auth)/login/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `clientApis.auth.oauthAuthorize` |

## app/(auth)/oauth/callback

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(auth)/oauth/callback/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | — |

## app/(auth)/register

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [layout.tsx](<../app/(auth)/register/layout.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `metadata` |
| [page.tsx](<../app/(auth)/register/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `clientApis.auth.register` |

## app/(auth)/reset-password

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(auth)/reset-password/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `clientApis.auth.resetPassword` |

## app/(auth)/verify-email

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(auth)/verify-email/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `clientApis.auth.verifyEmail`, `clientApis.auth.resendVerification` |

## app/(dashboard)/admin

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/admin/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.users.list` |

## app/(dashboard)/admin/users

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/admin/users/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `instant` |

## app/(dashboard)/chat

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/chat/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.chat.listRooms`, `serverApis.courses.listMine`, `serverApis.courses.list` |

## app/(dashboard)/courses/[courseId]/examinations/[examinationId]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/courses/[courseId]/examinations/[examinationId]/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.examinations.getForStudent`, `serverApis.examinations.get`, `serverApis.courses.get`, `serverApis.examinations.getMyAttempt`, `serverApis.examinations.listAttempts`, `serverApis.questions.listBanks` |

## app/(dashboard)/courses/[courseId]/exercises/[exerciseId]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/courses/[courseId]/exercises/[exerciseId]/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.courses.get`, `serverApis.assignments.getExercise`, `serverApis.assignments.getMySubmission`, `serverApis.assignments.listSubmissions` |

## app/(dashboard)/courses/[courseId]/lessons/[lessonId]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/courses/[courseId]/lessons/[lessonId]/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.courses.get`, `serverApis.lessons.get`, `serverApis.lessons.listMaterials`, `serverApis.lessons.list` |

## app/(dashboard)/courses/[courseId]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/courses/[courseId]/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.courses.get`, `serverApis.enrollments.listMine`, `serverApis.lessons.list`, `serverApis.assignments.listExercises`, `serverApis.examinations.listAvailable`, `serverApis.enrollments.listByCourse`, `serverApis.examinations.listByCourse`, `serverApis.questions.listBanks` |

## app/(dashboard)/courses

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/courses/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.courses.listMine`, `serverApis.courses.list`, `serverApis.enrollments.listMine` |

## app/(dashboard)

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [error.tsx](<../app/(dashboard)/error.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [layout.tsx](<../app/(dashboard)/layout.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `instant` |
| [loading.tsx](<../app/(dashboard)/loading.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [page.tsx](<../app/(dashboard)/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `instant` |
| [template.tsx](<../app/(dashboard)/template.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |

## app/(dashboard)/exams

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/exams/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.courses.listMine`, `serverApis.courses.list`, `serverApis.examinations.listAvailable`, `serverApis.examinations.listByCourse`, `serverApis.questions.listBanks` |

## app/(dashboard)/profile

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/profile/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `instant` |

## app/(dashboard)/question-banks

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/question-banks/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.questions.listBanks`, `serverApis.questions.listQuestions` |

## app/(dashboard)/settings

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/(dashboard)/settings/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `instant` |

## app/api/auth/login-code

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/auth/login-code/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `POST` |

## app/api/auth/login

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/auth/login/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `POST` |

## app/api/auth/logout

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/auth/logout/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `POST` |

## app/api/auth/refresh

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/auth/refresh/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `POST` |

## app/api/auth/session

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/auth/session/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `GET` |

## app/api/backend/[...path]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/backend/[...path]/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

## app/api/chat/realtime-token

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [route.ts](<../app/api/chat/realtime-token/route.ts>) | Next route handler/BFF; chạy server khi HTTP request đến | `POST` |

## app/exam-attempts/[examinationId]

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/exam-attempts/[examinationId]/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `serverApis.examinations.getForStudent`, `serverApis.examinations.getMyAttempt` |

## app/forbidden

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/forbidden/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | — |

## app

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [globals.css](<../app/globals.css>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [layout.tsx](<../app/layout.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `metadata` |
| [not-found.tsx](<../app/not-found.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [robots.ts](<../app/robots.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [sitemap.ts](<../app/sitemap.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |

## app/privacy

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/privacy/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | `metadata` |

## app/unauthorized

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [page.tsx](<../app/unauthorized/page.tsx>) | Trang App Router; tải dữ liệu/khởi tạo workspace khi truy cập route | — |

## components/admin

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [user-import-dialog.tsx](<../components/admin/user-import-dialog.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.users.create` |
| [user-management.tsx](<../components/admin/user-management.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.users.list`, `clientApis.users.update`, `clientApis.users.create`, `clientApis.users.updateStatus` |

## components

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [app-sidebar.tsx](<../components/app-sidebar.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `AppSidebar` |
| [breadcrumbs.tsx](<../components/breadcrumbs.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `Breadcrumbs` |
| [dashboard-header.tsx](<../components/dashboard-header.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `DashboardHeader` |
| [dashboard-shell.tsx](<../components/dashboard-shell.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `DashboardShell` |
| [development-toast-button.tsx](<../components/development-toast-button.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `DevelopmentToastButton` |
| [language-toggle.tsx](<../components/language-toggle.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `LanguageToggle` |
| [loading-skeleton.tsx](<../components/loading-skeleton.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `DashboardSkeleton` |
| [mobile-sidebar.tsx](<../components/mobile-sidebar.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `MobileSidebar` |
| [runtime-boundary.tsx](<../components/runtime-boundary.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `RuntimeBoundary` |
| [theme-provider.tsx](<../components/theme-provider.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `ThemeProvider` |
| [theme-script.tsx](<../components/theme-script.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `AppProviders` |
| [theme-toggle.tsx](<../components/theme-toggle.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `ThemeToggle` |
| [user-menu.tsx](<../components/user-menu.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `UserMenu` |

## components/auth

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [auth-session-provider.tsx](<../components/auth/auth-session-provider.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `AuthSessionProvider`, `useAuthSession` |
| [auth-shell.tsx](<../components/auth/auth-shell.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `AuthShell` |
| [auth-submit.tsx](<../components/auth/auth-submit.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `AuthSubmit` |
| [form-message.tsx](<../components/auth/form-message.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `FormMessage` |
| [oauth-callback-client.tsx](<../components/auth/oauth-callback-client.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.auth.oauthCallback` |
| [password-input.tsx](<../components/auth/password-input.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `PasswordInput` |

## components/chat

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [chat-composer.tsx](<../components/chat/chat-composer.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `ChatComposer` |
| [chat-message-list.tsx](<../components/chat/chat-message-list.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.chat.getAttachment` |
| [chat-room-list.tsx](<../components/chat/chat-room-list.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `roomLabel`, `ChatRoomList` |
| [chat-workspace.tsx](<../components/chat/chat-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.chat.markAsRead`, `clientApis.chat.joinRoom`, `clientApis.chat.getOrCreateCourseRoom`, `clientApis.chat.sendMessage`, `clientApis.chat.sendAttachment`, `clientApis.chat.editMessage`, `clientApis.chat.removeMessage`, `clientApis.chat.removeDirectRoom`, `clientApis.chat.getAttachment` |
| [direct-message-dialog.tsx](<../components/chat/direct-message-dialog.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.users.findForChat`, `clientApis.users.searchForChatByName`, `clientApis.chat.getOrCreateDirectRoom` |

## components/courses

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [assignment-submissions.tsx](<../components/courses/assignment-submissions.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.assignments.listSubmissions`, `clientApis.assignments.getSubmissionContent`, `clientApis.assignments.grade` |
| [course-assessment-actions.tsx](<../components/courses/course-assessment-actions.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.assignments.createExercise`, `clientApis.assignments.uploadAttachment` |
| [course-create-form.tsx](<../components/courses/course-create-form.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.courses.create` |
| [course-detail-header.tsx](<../components/courses/course-detail-header.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `CourseDetailHeader`, `CourseAccessNotice` |
| [course-detail-tabs.tsx](<../components/courses/course-detail-tabs.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.lessons.list`, `clientApis.assignments.listExercises`, `clientApis.examinations.listAvailable`, `clientApis.examinations.listByCourse`, `clientApis.lessons.reorder` |
| [course-enrollment-action.tsx](<../components/courses/course-enrollment-action.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.enrollments.request`, `clientApis.enrollments.cancel` |
| [course-management-panel.tsx](<../components/courses/course-management-panel.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.enrollments.addByEmail`, `clientApis.courses.get`, `clientApis.enrollments.listByCourse`, `clientApis.courses.update`, `clientApis.courses.remove`, `clientApis.courses.restore` |
| [exercise-workspace.tsx](<../components/courses/exercise-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.assignments.getExercise`, `clientApis.assignments.getMySubmission`, `clientApis.assignments.getAttachment`, `clientApis.assignments.uploadAttachment`, `clientApis.assignments.uploadSubmission`, `clientApis.assignments.submit`, `clientApis.assignments.unsubmit`, `clientApis.assignments.updateExercise`, `clientApis.assignments.removeExercise` |
| [lesson-create-dialog.tsx](<../components/courses/lesson-create-dialog.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.lessons.create`, `clientApis.lessons.uploadMaterial` |
| [lesson-detail-workspace.tsx](<../components/courses/lesson-detail-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.lessons.get`, `clientApis.lessons.update`, `clientApis.lessons.remove` |
| [lesson-materials.tsx](<../components/courses/lesson-materials.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.lessons.listMaterials`, `clientApis.lessons.getMaterialContent`, `clientApis.lessons.uploadMaterial`, `clientApis.lessons.removeMaterial` |

## components/dashboard

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [admin-home.tsx](<../components/dashboard/admin-home.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `serverApis.users.list`, `serverApis.courses.list` |
| [student-home.tsx](<../components/dashboard/student-home.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `serverApis.courses.listMine`, `serverApis.enrollments.listMine`, `serverApis.assignments.listExercises`, `serverApis.examinations.listAvailable`, `serverApis.assignments.getMySubmission`, `serverApis.examinations.getMyAttempt` |
| [teacher-home.tsx](<../components/dashboard/teacher-home.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `serverApis.courses.list`, `serverApis.questions.listBanks`, `serverApis.enrollments.listByCourse`, `serverApis.assignments.listExercises`, `serverApis.assignments.listSubmissions` |

## components/examinations

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [course-examination-header.tsx](<../components/examinations/course-examination-header.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `CourseExaminationHeader` |
| [draft-question-set-editor.tsx](<../components/examinations/draft-question-set-editor.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.questions.listBanks`, `clientApis.examinations.updateQuestionSet` |
| [examination-create-dialog.tsx](<../components/examinations/examination-create-dialog.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.examinations.create` |
| [examination-detail-workspace.tsx](<../components/examinations/examination-detail-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.examinations.update`, `clientApis.examinations.get`, `clientApis.examinations.reconnect`, `clientApis.examinations.getMyAttempt`, `clientApis.examinations.getQuestions`, `clientApis.examinations.submitAttempt`, `clientApis.examinations.startAttempt`, `clientApis.examinations.saveMultipleChoice`, `clientApis.examinations.saveFillInBlank` |
| [examination-question-selector.tsx](<../components/examinations/examination-question-selector.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.questions.listQuestions` |
| [examination-results.tsx](<../components/examinations/examination-results.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.examinations.listAttempts`, `clientApis.examinations.autoSubmit`, `clientApis.examinations.resetAttempt` |
| [examination-security-fields.tsx](<../components/examinations/examination-security-fields.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `ExaminationSecurityFields` |
| [examinations-workspace.tsx](<../components/examinations/examinations-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.courses.listMine`, `clientApis.courses.list`, `clientApis.examinations.listAvailable`, `clientApis.examinations.listByCourse`, `clientApis.questions.listBanks` |
| [use-examination-guard.ts](<../components/examinations/use-examination-guard.ts>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.examinations.recordViolation` |

## components/profile

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [profile-editor.tsx](<../components/profile/profile-editor.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.users.updateMe` |
| [profile-settings-workspace.tsx](<../components/profile/profile-settings-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.users.updateMe`, `clientApis.users.changeMyPassword`, `clientApis.users.getProfile` |

## components/questions

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [question-bank-sidebar.tsx](<../components/questions/question-bank-sidebar.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `QuestionBankSidebar` |
| [question-bank-workspace.tsx](<../components/questions/question-bank-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.questions.listBanks`, `clientApis.questions.listQuestions`, `clientApis.questions.updateBank`, `clientApis.questions.createBank`, `clientApis.users.findForChat`, `clientApis.questions.shareBank`, `clientApis.questions.removeBank`, `clientApis.questions.updateQuestion`, `clientApis.questions.createMultipleChoice`, `clientApis.questions.createFillInBlank`, `clientApis.questions.removeQuestion` |
| [question-card.tsx](<../components/questions/question-card.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `QuestionCard` |
| [question-import-dialog.tsx](<../components/questions/question-import-dialog.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.questions.createMultipleChoice`, `clientApis.questions.createFillInBlank` |

## components/settings

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [settings-workspace.tsx](<../components/settings/settings-workspace.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `SettingsWorkspace` |

## components/teacher

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [teacher-dashboard-work-tabs.tsx](<../components/teacher/teacher-dashboard-work-tabs.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `TeacherDashboardWorkTabs` |
| [teacher-enrollments-queue.tsx](<../components/teacher/teacher-enrollments-queue.tsx>) | Component/hook giao diện; xem supporting-features và các lời gọi API dưới đây | `clientApis.enrollments.accept`, `clientApis.enrollments.reject` |

## components/ui

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [area-refresh-button.tsx](<../components/ui/area-refresh-button.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `AreaRefreshButton` |
| [button.tsx](<../components/ui/button.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `Button` |
| [dropdown-menu.tsx](<../components/ui/dropdown-menu.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` |
| [form-field-feedback.tsx](<../components/ui/form-field-feedback.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `ValidatedForm`, `RequiredMark`, `FieldError` |
| [page-chrome.tsx](<../components/ui/page-chrome.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `PageHeader`, `PageSection`, `EmptyState`, `StatRow`, `TextLink`, `AlertBanner`, `ListRow`, `DividedList` |
| [paginated-list.tsx](<../components/ui/paginated-list.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `DEFAULT_PAGE_SIZE`, `PaginationControls`, `PaginatedChildren` |
| [sheet.tsx](<../components/ui/sheet.tsx>) | UI primitive dùng chung; hiển thị/tương tác theo props | `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetTitle` |

## .

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [eslint.config.mjs](<../eslint.config.mjs>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [next-env.d.ts](<../next-env.d.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [next.config.ts](<../next.config.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [package.json](<../package.json>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |
| [tsconfig.json](<../tsconfig.json>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | — |

## lib/api

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [auth-session-client.ts](<../lib/api/auth-session-client.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `authSessionApi` |
| [chat-realtime.ts](<../lib/api/chat-realtime.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `createChatHubConnection` |
| [client-apis.ts](<../lib/api/client-apis.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `clientApis` |
| [client.ts](<../lib/api/client.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `clientRequest` |
| [errors.ts](<../lib/api/errors.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `ApiError`, `toApiError` |
| [server-apis.ts](<../lib/api/server-apis.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `serverApis` |
| [server-client.ts](<../lib/api/server-client.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `setAuthCookies`, `clearAuthCookies`, `serverBackendRequest`, `serverRequest` |
| [session-route.ts](<../lib/api/session-route.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `handleSessionResponse`, `clearSession` |
| [transport.ts](<../lib/api/transport.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `QueryValue`, `ApiRequestOptions`, `ApiTransport`, `withQuery`, `createRequestInit` |

## lib/api/features

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [assignments.ts](<../lib/api/features/assignments.ts>) | API wrapper theo module; nhận transport client/server | `createAssignmentsApi`, `AssignmentsApi` |
| [auth.ts](<../lib/api/features/auth.ts>) | API wrapper theo module; nhận transport client/server | `createAuthApi`, `AuthApi` |
| [chat.ts](<../lib/api/features/chat.ts>) | API wrapper theo module; nhận transport client/server | `createChatApi`, `ChatApi` |
| [courses.ts](<../lib/api/features/courses.ts>) | API wrapper theo module; nhận transport client/server | `createCoursesApi`, `CoursesApi` |
| [enrollments.ts](<../lib/api/features/enrollments.ts>) | API wrapper theo module; nhận transport client/server | `AddStudentResultDto`, `createEnrollmentsApi`, `EnrollmentsApi` |
| [examinations.ts](<../lib/api/features/examinations.ts>) | API wrapper theo module; nhận transport client/server | `createExaminationsApi`, `ExaminationsApi` |
| [lessons.ts](<../lib/api/features/lessons.ts>) | API wrapper theo module; nhận transport client/server | `createLessonsApi`, `LessonsApi` |
| [questions.ts](<../lib/api/features/questions.ts>) | API wrapper theo module; nhận transport client/server | `createQuestionsApi`, `QuestionsApi` |
| [users.ts](<../lib/api/features/users.ts>) | API wrapper theo module; nhận transport client/server | `createUsersApi`, `UsersApi` |

## lib/auth

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [localized-message.ts](<../lib/auth/localized-message.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `localizeAuthMessage` |
| [roles.ts](<../lib/auth/roles.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `isAdministratorRole` |
| [routes.ts](<../lib/auth/routes.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `roleHome` |
| [session.ts](<../lib/auth/session.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `getCurrentUser`, `requireAuth`, `requireRole` |
| [validation.ts](<../lib/auth/validation.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `emailSchema`, `fullNameSchema`, `phoneSchema`, `passwordSchema`, `humanCodeSchema`, `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `verifyCodeSchema`, `resetPasswordSchema` |

## lib

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [i18n-server.ts](<../lib/i18n-server.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `getServerLanguage`, `translate` |
| [i18n.tsx](<../lib/i18n.tsx>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `Language`, `LanguageProvider`, `useLanguage` |
| [questions-excel.ts](<../lib/questions-excel.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `MAX_IMPORT_ROWS`, `ImportErrorCode`, `ImportRow`, `parseQuestionsWorkbook`, `downloadQuestionsTemplate` |
| [users-excel.ts](<../lib/users-excel.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `MAX_USER_IMPORT_ROWS`, `UserImportErrorCode`, `UserImportRow`, `parseUsersWorkbook`, `downloadUsersTemplate` |
| [utils.ts](<../lib/utils.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `cn` |

## types

| File | Làm gì / khi dùng | Điểm truy vết |
| --- | --- | --- |
| [api.ts](<../types/api.ts>) | Thành phần hỗ trợ/cấu hình; tra supporting-components hoặc supporting-features | `Role`, `AccountStatus`, `CourseStatus`, `EnrollmentStatus`, `LessonStatus`, `ExerciseStatus`, `SubmissionStatus`, `QuestionType`, `QuestionDifficulty`, `ExaminationStatus` |
