# Frontend – Tổng quan

Ứng dụng **SFIT Study**: giao diện web cho LMS, chạy trên Next.js. Frontend không có logic nghiệp vụ riêng; toàn bộ dữ liệu và quyền do backend quyết định (xem `docs/overview.md` trong repo backend).

## 1. Công nghệ

| Hạng mục | Công nghệ |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, `cacheComponents`, `partialPrefetching`), React 19 |
| Ngôn ngữ | TypeScript 5 |
| Style | Tailwind CSS 4 (`@tailwindcss/turbopack`), `tailwind-merge`, `clsx` |
| UI | Radix UI (Dialog, Dropdown Menu), `lucide-react`, `react-icons`, component nội bộ trong `components/ui` |
| Form/Validation | `react-hook-form`, `@hookform/resolvers`, `zod` |
| Realtime | `@microsoft/signalr` |
| Phiên đăng nhập | Cookie HTTP-only, đọc JWT bằng `jose` |
| Theme | `next-themes` + script chống nháy (sáng/tối) |
| Excel | `exceljs` (import câu hỏi) |
| Lint | ESLint 9 + `eslint-config-next` |

> `lms-frontend/AGENTS.md` nhắc đây là bản Next.js có thay đổi lớn: khi viết code mới, đọc tài liệu trong `node_modules/next/dist/docs/`.

## 2. Chạy local

```bash
cd lms-frontend
npm install

# .env.local
BACKEND_API_URL=http://localhost:5258/api
# Tùy chọn: URL hub SignalR công khai nếu không suy ra được từ BACKEND_API_URL
BACKEND_HUB_URL=http://localhost:5258/hubs/chat

npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

| Biến | Ý nghĩa | Mặc định |
| --- | --- | --- |
| `BACKEND_API_URL` | Base URL REST của backend (server-side) | `http://localhost:5258/api` |
| `BACKEND_HUB_URL` | URL hub SignalR trả cho trình duyệt cùng realtime token | Suy ra: bỏ đuôi `/api`, thêm `/hubs/chat` |

Backend phải chạy trước và khai báo `Cors:AllowedOrigins` chứa `http://localhost:3000` để SignalR hoạt động (xem `docs/setup.md` trong repo backend). Google OAuth cần `OAUTH__GOOGLE__CLIENTCALLBACKURI=http://localhost:3000/oauth/callback`.

## 3. Cấu trúc thư mục

```text
lms-frontend
├── app/
│   ├── (auth)/            Trang công khai: login, register, verify-email, forgot/reset-password, oauth/callback
│   ├── (dashboard)/       Trang sau đăng nhập (layout gọi requireAuth, có sidebar/header)
│   ├── exam-attempts/     Màn hình làm bài thi toàn màn hình (chỉ Student)
│   ├── api/               Route handler phía server (BFF): auth/*, backend/[...path], chat/realtime-token
│   └── forbidden/ unauthorized/ not-found.tsx
├── components/            UI theo module: admin, auth, chat, courses, dashboard, examinations, profile, questions, teacher, ui
├── lib/
│   ├── api/               transport, client (browser), server-client (server), features/*, chat-realtime
│   ├── auth/              session (requireAuth/requireRole), validation, routes
│   ├── i18n.tsx / i18n-server.ts   Đa ngôn ngữ
│   └── questions-excel.ts Parse/xuất Excel câu hỏi
└── types/api.ts           Kiểu TypeScript của DTO backend
```

## 4. Route và phân quyền

Bảo vệ bằng `requireAuth()` (chưa đăng nhập → `/login`) và `requireRole(...)` (sai role → `/forbidden`) ở phía server. Backend vẫn là nơi quyết định cuối cùng.

| Route | Quyền | Nội dung |
| --- | --- | --- |
| `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | Public | Luồng tài khoản |
| `/oauth/callback` | Public | Nhận `loginCode` từ Google, đổi lấy phiên qua `/api/auth/login-code` |
| `/` | Đăng nhập | Trang chủ theo role (`StudentHome`, `TeacherHome`, `AdminHome`) |
| `/courses` | Đăng nhập | Danh sách khóa học, lọc, đăng ký (Student); admin có “bao gồm đã xóa” |
| `/courses/[courseId]` | Đăng nhập | Tab bài giảng / bài tập / kỳ thi, thêm tab quản lý cho Teacher/Admin; query `?tab=` |
| `/courses/[courseId]/lessons/[lessonId]` | Đăng nhập | Bài giảng và tài liệu |
| `/courses/[courseId]/exercises/[exerciseId]` | Đăng nhập | Bài tập, nộp bài, chấm điểm |
| `/courses/[courseId]/examinations/[examinationId]` | Đăng nhập | Chi tiết kỳ thi, kết quả |
| `/exams` | Đăng nhập | Tổng hợp kỳ thi qua các khóa học |
| `/question-banks` | Teacher, Admin | Ngân hàng câu hỏi, import Excel |
| `/chat` | Đăng nhập | Tin nhắn; query `?courseId=&roomId=` |
| `/admin`, `/admin/users` | Admin | Quản lý người dùng |
| `/profile` | Đăng nhập | Hồ sơ, đổi mật khẩu, giao diện; `/settings` chuyển hướng về đây |
| `/exam-attempts/[examinationId]` | Student | Làm bài thi (toàn màn hình, có giám sát) |
| `/forbidden`, `/unauthorized`, 404 | – | Trang lỗi |

Điều hướng sidebar: Overview, Courses, Examinations, Messages cho mọi role; Question banks cho Teacher/Admin; Users cho Admin. Trang chi tiết khóa học: Student chưa `Accepted` chỉ thấy thông báo truy cập, không thấy nội dung.

## 5. Đa ngôn ngữ (vi/en)

- `LanguageProvider` (`lib/i18n.tsx`) lưu ngôn ngữ trong `localStorage` và cookie cùng tên khóa `sfit-study-language` (1 năm) để server render đúng ngôn ngữ.
- Server Component dùng `getServerLanguage()` và `translate(language, "English text")` từ `lib/i18n-server.ts`; client dùng `useLanguage()`.
- Mọi chuỗi UI phải có bản Vietnamese và English; không hard-code chuỗi mới ngoài hệ thống này.
- Nút chuyển ngôn ngữ: `components/language-toggle.tsx`.

## 6. Theme và UI

- Sáng/tối qua `theme-provider`/`theme-script`/`theme-toggle`; màu chủ đạo xanh lá.
- Shell dashboard: `dashboard-shell`, `app-sidebar` (thu gọn được), `mobile-sidebar`, `dashboard-header`, `breadcrumbs`, `user-menu`.
- Trạng thái chung: `loading-skeleton`, `runtime-boundary`, `error.tsx`, `loading.tsx`, `ui/page-chrome` (`PageHeader`, `AlertBanner`, `EmptyState`).
- Responsive: sidebar dạng Sheet trên mobile; các bảng/danh sách xếp chồng ở màn hẹp.

## 7. Kiểu dữ liệu

`types/api.ts` khai báo DTO/enum khớp contract backend (xem `docs/api/conventions.md` trong repo backend). Khi backend đổi DTO, cập nhật file này và các module `lib/api/features/*`.
