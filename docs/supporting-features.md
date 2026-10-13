# Chức năng phụ và file hỗ trợ frontend

Đối chiếu ngày **2026-10-13**. [Source map](source-map.md) liệt kê file và lời gọi API; [integration](api-integration.md) mô tả luồng. Đường dẫn dưới tính từ frontend root.

## 1. Cấu trúc và vòng đời trang

| File / nhóm | Làm gì, dùng lúc nào |
| --- | --- |
| `app/layout.tsx` | Root HTML, Geist/Geist Mono, metadata/JSON-LD, AppProviders, Suspense + RuntimeBoundary cho mọi trang |
| `components/runtime-boundary.tsx` | `await connection()` để đợi request trước khi render phần con cần runtime |
| `app/(auth)/layout.tsx`, `components/auth/auth-shell.tsx` | Khung login/register/verify/reset/OAuth, không phải rào quyền backend |
| `app/(dashboard)/layout.tsx`, `template.tsx` | Yêu cầu phiên, bố cục ứng dụng và vòng đời dashboard |
| `components/dashboard-shell.tsx`, sidebar/header/breadcrumbs/user-menu | Điều hướng desktop/mobile, thông tin user, đăng xuất, theme/ngôn ngữ |
| `app/(dashboard)/loading.tsx`, `components/loading-skeleton.tsx` | Giao diện chờ tải, không sinh dữ liệu giả |
| `app/(dashboard)/error.tsx`, `app/not-found.tsx`, forbidden/unauthorized | Hiển thị lỗi/tải lại hoặc trạng thái quyền; API vẫn quyết định status |
| `components/ui/page-chrome.tsx` | PageHeader/AlertBanner/EmptyState dùng lại giữa module |
| `components/ui/area-refresh-button.tsx` | Nút refresh theo vùng; callback gọi API của vùng, không phải đồng bộ nền toàn app |
| `components/ui/paginated-list.tsx` | Thành phần danh sách/phân trang dùng lại; không tự tạo khả năng phân trang backend |
| `components/ui/button.tsx`, form-field-feedback, sheet, dropdown-menu | Primitive UI/accessibility và trạng thái tương tác; Radix cho dialog/dropdown |
| `lib/utils.ts` | `cn = twMerge(clsx(...))`, ghép class và giải quyết class Tailwind trùng |

`/settings` hiện redirect `/profile`; `/admin/users` redirect `/admin`. Các component cũ `settings/settings-workspace.tsx`, `profile/profile-editor.tsx`, `auth/auth-session-provider.tsx`, `development-toast-button.tsx` vẫn có trong cây nguồn nhưng không thấy import sử dụng trong luồng app hiện tại qua rà soát tĩnh. Sự tồn tại của file không chứng minh feature đang được mount. Trang profile dùng `ProfileSettingsWorkspace`; root providers hiện chỉ ghép LanguageProvider và ThemeProvider.

## 2. Phiên, BFF và trợ giúp API

| File | Vai trò | Dùng khi nào |
| --- | --- | --- |
| `lib/auth/session.ts` | Decode JWT bằng jose, đọc profile backend, requireAuth/requireRole | Server page/layout kiểm tra phiên và role |
| `lib/auth/roles.ts` | Nhận diện Admin hoặc System | Quyền UI quản trị; backend còn kiểm tra chi tiết |
| `lib/auth/routes.ts` | roleHome hiện luôn `/` | Sau đăng nhập; trang `/` tự chọn dashboard theo role |
| `lib/auth/validation.ts` | Schema/validation auth | Form email/password/name/phone trước khi gọi API |
| `lib/auth/localized-message.ts` | Chọn thông báo auth theo ngôn ngữ | Hiển thị lỗi form/API |
| `app/(auth)/register/page.tsx` | Đăng ký tài khoản; lỗi `409` hiển thị song ngữ ở form và trường email, rồi focus email | Email đã tồn tại dùng luồng kích hoạt/gửi lại mã riêng |
| `lib/api/transport.ts` | withQuery + createRequestInit; xử lý JSON, FormData, raw body | Cả browser/server transport |
| `lib/api/client.ts` | Fetch `/api/backend...`, no-store, same-origin; JSON/204/Blob | Client Components |
| `lib/api/server-client.ts` | Backend URL, Bearer, cookie, retry một lần sau 401 | Server Components và BFF handlers |
| `lib/api/errors.ts` | ApiError, parse JSON/problem+json/text/body rỗng, fieldErrors | Request thất bại; không giả định mọi 401/429 có JSON |
| `lib/api/features/*.ts` | Các hàm module độc lập transport | Gọi users/courses/enrollments/lessons/assignments/questions/examinations/chat/auth |
| `lib/api/client-apis.ts`, `server-apis.ts` | Ghép features với transport tương ứng | Dùng cùng contract giữa browser và server |
| `lib/api/auth-session-client.ts` | Gọi route auth riêng của Next | Login/loginCode/refresh/logout/session; không dùng proxy generic cho token pair |
| `lib/api/session-route.ts` | Chuyển token pair thành cookie và chỉ trả metadata; clearSession 204 | Auth route handlers |
| `types/api.ts` | DTO/enums TypeScript viết tay | Type-check compile-time, không tự validate mọi JSON response ở runtime |

Frontend không giữ JWT signing key, không kết nối Redis/DB/SMTP/S3 bằng SDK. Next server gọi REST nội bộ; browser gọi hub công khai bằng realtime JWT. Cookie/lang và sessionStorage OAuth không thay DB nghiệp vụ. Giới hạn refresh và forwarding header được ghi ở [findings](review-findings.md).

## 3. ExcelJS: import, template, export

| File | Tình huống | API / giới hạn |
| --- | --- | --- |
| `lib/questions-excel.ts` | Đọc worksheet đầu, header normalize, tạo payload MCQ/FIB, xuất workbook mẫu + Guide | Tối đa 500 dòng không rỗng; Type/Content/Difficulty/ShuffleOptions/CorrectOption/OptionN/AnswerN |
| `components/questions/question-import-dialog.tsx` | Chọn file, preview lỗi, gửi từng câu hợp lệ | File ≤5×1024×1024 byte; POST bank multiple-choice/fill-in-blank; không upload nguyên workbook lên backend |
| `lib/users-excel.ts` | Parse email/fullname/password/phone/role, phát hiện email trùng, xuất template | Tối đa 200 dòng; role mặc định Student, Admin chỉ cho System; không tạo System |
| `components/admin/user-import-dialog.tsx` | Preview kết quả rồi tạo user tuần tự, báo lỗi từng dòng | File ≤2×1024×1024 byte; POST `/api/users`; không transaction gộp tất cả dòng |
| `components/examinations/examination-results.tsx` | Xuất danh sách kết quả cả lớp | GET mọi trang `/examinations/{id}/attempts` pageSize 20 rồi dựng XLSX Blob |

ExcelJS được dynamic import khi cần. Không có Excel parser backend hoặc API bulk-import riêng. Mỗi dòng thành request riêng, có thể chạm rate limit 240/min; thành công một phần không rollback dòng đã lưu. Parser dừng khi đạt giới hạn dòng, không xử lý phần dư. Template có 8 option/5 answer nhưng parser nhận các cột OptionN/AnswerN đã tìm thấy, không phải giới hạn cứng của API.

## 4. Chat và tác vụ trình duyệt

`lib/api/chat-realtime.ts` tạo HubConnection, token closure, backoff reconnect. `chat-workspace.tsx` điều phối rooms/messages, join room, read receipt, tải lịch sử sau reconnect; các component room-list/message-list/composer/direct-message-dialog tách hiển thị và thao tác. Tìm người theo email hoặc tên gọi hai API search-for-chat khác nhau; không cần quyền quản trị để tìm user chat.

Xóa direct conversation gọi DELETE room và cập nhật UI; backend chỉ ẩn cho participant hiện tại. Preview/tải attachment dùng Blob/Object URL (thu hồi URL sau dùng); không ghép URL từ objectKey. Native prompt/confirm hiện còn dùng ở một số thao tác chat. Không có hệ thống push notification/notification center backend riêng trong mã nguồn.

## 5. Giám sát thi và đồng hồ

`components/examinations/use-examination-guard.ts` chỉ chạy theo trạng thái active/cấu hình security được truyền: fullscreen, visibility/focus, copy/paste, right click, phím nghi DevTools và kích thước cửa sổ. Dò DevTools mỗi 250ms khi bật, báo vi phạm bằng REST; page leave gửi disconnect keepalive. Đây là tín hiệu trình duyệt, không chống gian lận tuyệt đối; browser/OS có thể giữ quyền phím tắt và request lúc đóng tab có thể không tới server.

`examination-detail-workspace.tsx` có đồng hồ hiển thị/countdown; lưu đáp án gọi API từng câu, kết quả cuối do backend chấm. `examination-question-selector.tsx` nạp câu hỏi theo bank được chọn; `draft-question-set-editor.tsx` thay bộ snapshot khi Draft. `examination-security-fields.tsx` là form cấu hình, không tự thực thi quyền trên server.

`exercise-workspace.tsx` polling bài nộp 15 giây trong nhánh theo dõi; không có frontend worker chạy bền vững khi đóng trình duyệt. Hai hosted worker thật ở backend được mô tả [tại đây](../../backend/docs/architecture/supporting-components.md).

## 6. i18n, theme, SEO và trang phụ

- `lib/i18n.tsx`: LanguageProvider/useLanguage/dictionary, lưu localStorage và cookie `sfit-study-language`, cập nhật ngôn ngữ client. `lib/i18n-server.ts` đọc cookie, fallback vi và translate chuỗi server. Component còn có copy song ngữ cục bộ; thư email nằm backend và hiện tiếng Anh.
- `components/language-toggle.tsx`: đổi ngôn ngữ; `theme-provider.tsx` bọc next-themes, `theme-script.tsx` tên file nhưng thực tế xuất AppProviders, `theme-toggle.tsx` điều khiển theme. Không có API lưu preference theme/lang theo user.
- `app/globals.css`: design tokens/light-dark/Tailwind và style chung; shadcn-style primitives nằm nội bộ, không có dependency `shadcn` runtime.
- `app/layout.tsx`: metadata/canonical/OpenGraph/Twitter/JSON-LD dùng NEXT_PUBLIC_SITE_URL, font Google qua next/font; build có thể cần tải font. Metadata không xác nhận site đang publish.
- `app/robots.ts`: tạo robots.txt; `app/sitemap.ts`: sitemap cho login/register/privacy. Robots không phải cơ chế phân quyền.
- `app/privacy/page.tsx`: trang chính sách; `public/` chứa logo/assets tĩnh. Không có API privacy riêng.

## 7. Build, lint và deployment

`next.config.ts` bật cacheComponents, partialPrefetching, experimental.agentFeedback và Tailwind Turbopack loader. Các API fetch vẫn no-store. `tsconfig.json` thiết lập TypeScript/alias; `next-env.d.ts` là khai báo framework; `eslint.config.mjs` cấu hình lint. package.json là khoảng dependency, package-lock.json pin cây resolve; dùng npm ci cho tái lập.

Dockerfile dùng Node 22, build Next rồi npm ci --omit=dev cho runtime, chạy user node; không phải static export. Workflow CI chạy npm ci → lint → tsc --noEmit → build → Docker build; publish/deploy chỉ main push/workflow_dispatch sau checks. Không có script test frontend hoặc bộ E2E được khai báo trong package.json. Phân biệt kiểm tra tĩnh với test browser thực tế.
