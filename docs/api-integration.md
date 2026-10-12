# Frontend – Tích hợp API backend

Đối chiếu mã nguồn ngày **2026-10-13**. Mô tả implementation trong repository, không phải xác nhận môi trường production.

## 1. Mô hình: Next.js làm BFF

Trình duyệt **không** gọi REST của backend trực tiếp và **không** giữ token trong JavaScript. Next.js server đóng vai trò proxy (BFF):

```text
Trình duyệt ──► /api/backend/{path}  (Next route handler)
                 │  đọc cookie HTTP-only lms_access_token
                 │  thêm Authorization: Bearer
                 ▼
               Backend {BACKEND_API_URL}/{path}
```

Ngoại lệ: SignalR kết nối thẳng từ trình duyệt tới backend bằng realtime token ngắn hạn.

## 2. Cookie phiên

| Cookie | Nội dung | Thuộc tính |
| --- | --- | --- |
| `lms_access_token` | JWT access token | `httpOnly`, `sameSite=lax`, `path=/`, `secure` ở production, `maxAge` = thời gian còn lại của token |
| `lms_refresh_token` | Refresh token | như trên, `maxAge` theo `refreshTokenExpiresAt` |
| `sfit-study-language` | Ngôn ngữ giao diện | Ghi bởi client, 1 năm |

## 3. Route handler (`app/api`)

| Route | Method | Chức năng | Backend tương ứng |
| --- | --- | --- | --- |
| `/api/auth/login` | POST | Đăng nhập, đặt cookie | `POST /api/auth/login` |
| `/api/auth/login-code` | POST | Đổi login code OAuth, đặt cookie | `POST /api/auth/login-code` |
| `/api/auth/refresh` | POST | Làm mới token (body hoặc cookie refresh) | `POST /api/auth/refresh` |
| `/api/auth/logout` | POST | Xóa 2 cookie, trả `204` | – |
| `/api/auth/session` | GET | Giải mã JWT lấy userId, gọi profile, trả `{ user, expiresAt }`; `401` nếu không có/không hợp lệ | `GET /api/users/{userId}/profile` |
| `/api/chat/realtime-token` | POST | Lấy realtime token, trả kèm `hubUrl` (`Cache-Control: no-store`) | `POST /api/chat/realtime-token` |
| `/api/backend/[...path]` | GET/POST/PUT/PATCH/DELETE | Proxy mọi endpoint còn lại, giữ query, body (kể cả multipart), `Content-Type`, `Content-Disposition`; chuyển tiếp `Set-Cookie` | `{path}` |

Proxy chặn `auth/login`, `auth/refresh`, `auth/login-code` (trả `404`) vì ba endpoint này phải đi qua route riêng để đặt cookie.

Response của `login`/`login-code`/`refresh` chỉ trả metadata, **không** trả token:

```json
{
  "expiresAt": "2026-09-04T13:00:00Z",
  "refreshTokenExpiresAt": "2026-10-04T12:00:00Z"
}
```

Response `/api/auth/session`:

```json
{
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "student@example.com",
    "fullName": "Student",
    "phone": null,
    "role": "Student",
    "status": "Active",
    "avatarUrl": null,
    "createdAt": "2026-09-04T10:00:00Z",
    "hasPassword": true,
    "isGoogleLinked": false
  },
  "expiresAt": "2026-09-04T13:00:00Z"
}
```

Response `/api/chat/realtime-token`:

```json
{
  "accessToken": "short-lived-chat-jwt",
  "expiresAt": "2026-10-09T10:02:00Z",
  "hubUrl": "http://localhost:5258/hubs/chat"
}
```

## 4. Tự động refresh token

`serverBackendRequest` (`lib/api/server-client.ts`):

1. Gọi backend với access token trong cookie.
2. Nếu `401` và có refresh token: gọi `POST /auth/refresh`.
3. Refresh thành công: ghi lại cookie mới và gửi lại request gốc một lần. Thất bại: xóa cookie, trả `401` gốc.

Giới hạn hiện tại: `setAuthCookies`/`clearAuthCookies` bọc try/catch và bỏ qua lỗi ghi cookie. Trong ngữ cảnh không cho ghi cookie, request retry có thể thành công với token mới nhưng browser chưa nhận refresh token đã xoay. `getCurrentUser` trả null ngay nếu không có access cookie dù refresh cookie còn; chưa có cơ chế gom các refresh đồng thời. Vì vậy không coi refresh 30 ngày là cam kết duy trì đăng nhập 30 ngày trong mọi tình huống. Vấn đề và đề xuất tách riêng tại [review-findings.md](review-findings.md).

`requireAuth()` (`lib/auth/session.ts`) giải mã `sub`/`nameidentifier` từ JWT, gọi `/users/{id}/profile`; không đăng nhập thì `redirect("/login")`. `requireRole()` thêm kiểm tra role, sai thì `redirect("/forbidden")`.

## 5. Lớp API (`lib/api`)

```text
features/*.ts   Hàm theo module, nhận một ApiTransport: auth, users, courses, enrollments,
                lessons, assignments, questions, examinations, chat
client-apis.ts  clientApis = features bọc clientRequest  (browser → /api/backend/*)
server-apis.ts  serverApis = features bọc serverRequest  (server → backend trực tiếp, có refresh)
transport.ts    ApiRequestOptions, withQuery, createRequestInit (JSON hoặc FormData)
errors.ts       ApiError (status, title, detail, isUnauthorized, isNotFound, ...) từ ProblemDetails
```

- Server Component dùng `serverApis.*`; Client Component dùng `clientApis.*`.
- Response `204` trả `undefined`; response JSON được parse; còn lại trả `Blob` (file).
- Lỗi HTTP ném `ApiError` đọc từ `ProblemDetails` của backend.
- Kiểu dữ liệu nằm ở `types/api.ts`.

## 6. Đăng nhập Google

1. Nút Google gọi `authApi.oauthAuthorize("Google")` (qua proxy) → nhận `authorizationUrl`, điều hướng.
2. Google → backend callback → backend redirect tới `/oauth/callback?loginCode=...` của frontend.
3. `OAuthCallbackClient` gọi `authSessionApi.redeemLoginCode({ loginCode })` → `/api/auth/login-code` → cookie phiên được đặt → chuyển vào dashboard.

Callback cấu hình cho BFF phải là `http://localhost:3000/api/backend/auth/oauth/Google/callback` (production dùng HTTPS host frontend). BFF chuyển Cookie vào backend, giữ redirect callback ở chế độ manual, chuyển Location/Set-Cookie ra browser. Không đặt callback trên host API khác với host đã nhận cookie binding. Code callback cũng hỗ trợ nhận `code/state` và gọi proxy; sessionStorage đánh dấu pending/completed để hạn chế redeem trùng trong tab, không lưu token dài hạn.

Liên kết Google cho tài khoản đang đăng nhập dùng `oauthLinkAuthorize("Google")`.

Backend link callback hiện trả JSON `{userId,provider,externalEmail}`, không redirect như login callback. Tổng quát proxy chỉ chuyển tiếp một tập header (Content-Type, Content-Disposition, Content-Length, Accept-Ranges, Location, Set-Cookie); không chuyển mọi header, đặc biệt Range/Content-Range và Cache-Control backend chưa được giữ đầy đủ.

## 7. Chat realtime

`createChatHubConnection()` (`lib/api/chat-realtime.ts`):

1. `POST /api/chat/realtime-token` → `{ accessToken, expiresAt, hubUrl }`.
2. Tạo `HubConnection` tới `hubUrl` với `accessTokenFactory` tự lấy token mới nếu còn dưới 15 giây.
3. `withAutomaticReconnect` với backoff `min(30s, 1s × 2^n)`, thử vô hạn.

Luồng trong `components/chat`: tải danh sách room/lịch sử bằng REST → `JoinRoom` → nhận `MessageReceived`, `MessageUpdated`, `MessageDeleted`. Sau reconnect cần join lại room và đồng bộ lại lịch sử gần nhất. Chi tiết sự kiện: tài liệu `docs/api/chat.md` trong repo backend.

## 8. Giám sát khi làm bài thi

`components/examinations/use-examination-guard.ts` chạy khi attempt `InProgress` và dựa vào `security` của kỳ thi:

| Hành vi trình duyệt | Vi phạm gửi backend | Điều kiện bật |
| --- | --- | --- |
| Đổi tab (`visibilitychange`) | `TabChanged` | `detectTabChange` |
| Cửa sổ mất focus | `WindowBlurred` | `detectTabChange` |
| Copy/cut/Ctrl+C/X | `CopyAttempt` | `blockCopyPaste` |
| Paste/Ctrl+V | `PasteAttempt` | `blockCopyPaste` |
| Chuột phải | `RightClickAttempt` | `blockRightClick` |
| F11, F12, Ctrl+Shift+I/J/C/K, Ctrl+U, kích thước cửa sổ bất thường | `DevToolsSuspected` | `detectDevTools` |
| Thoát fullscreen | `ExitFullscreen` kèm `durationSeconds` | `requireFullscreen` |

Mỗi vi phạm gọi `POST /api/backend/examination-attempts/{attemptId}/violations?violationType=...`. Việc dò kích thước cửa sổ để phát hiện DevTools chạy mỗi 250 ms. Khi rời trang, `fetch(..., { keepalive: true })` gọi `.../disconnect`. Backend vẫn là nơi đếm vi phạm, áp `maxViolations` và tự nộp bài; frontend chỉ phát hiện và báo. Hook thử khóa Escape bằng Keyboard Lock (Chromium) khi fullscreen và chặn PrintScreen. F11 được phát hiện/thử chặn nhưng trình duyệt có thể giữ quyền xử lý phím tắt cấp hệ thống; không thể bảo đảm chặn bằng JavaScript.

Luồng thi: trang kỳ thi → `start` → `/exam-attempts/{examinationId}` (yêu cầu attempt `InProgress`/`Disconnected`, nếu không sẽ chuyển về trang kỳ thi) → lưu đáp án từng câu → `submit`. Reload gọi `my-attempt` để khôi phục, `Disconnected` thì gọi `reconnect`.

## 9. Import câu hỏi từ Excel

`lib/questions-excel.ts` + `components/questions/question-import-dialog.tsx` đọc file `.xlsx` bằng `exceljs` ở trình duyệt (tối đa 500 dòng, có tải file mẫu), chuyển thành request `multiple-choice`/`fill-in-blank` và gọi từng endpoint question-bank (xem `docs/api/question-banks.md` trong repo backend).

## 10. Import tài khoản từ Excel (Admin/System)

`lib/users-excel.ts` + `components/admin/user-import-dialog.tsx` (nút "Nhập từ Excel" ở `/admin`) đọc file `.xlsx` bằng `exceljs` ở trình duyệt (tối đa 200 dòng, file ≤ 2 MB, có tải file mẫu). Cột: `Email`, `FullName`, `Password`, `Phone`, `Role` (mặc định `Student`; `Admin` chỉ khi người thao tác là System). Dòng hợp lệ được gọi lần lượt `POST /api/users` (cùng API với form "Thêm người dùng"); dòng lỗi (validate phía client hoặc backend trả lỗi, ví dụ email trùng) được hiển thị theo từng dòng và không chặn các dòng còn lại.

## 11. Thêm học viên vào khóa học bằng email

Trang quản lý khóa học (`components/courses/course-management-panel.tsx`, mục "Yêu cầu đăng ký") có ô nhập nhiều email (phân tách bằng dấu phẩy, khoảng trắng, xuống dòng; tối đa 100). Gọi `clientApis.enrollments.addByEmail` → `POST /api/courses/{courseId}/enrollments/by-email`, hiển thị kết quả từng email (`Added`, `AlreadyAccepted`, `InvalidEmail`, `NotFound`, `NotStudent`, `Inactive`, `CourseFull`); email lỗi được giữ lại trong ô nhập để sửa. Chỉ hiện khi khóa học `Open` và chưa xóa mềm.

## 12. Reset lượt thi

Giảng viên khóa học có thể xóa lượt thi từ lịch sử kết quả; thao tác gọi `DELETE /api/examinations/{examinationId}/attempts/{attemptId}` qua `clientApis.examinations.resetAttempt`. Backend xóa lượt thi cùng đáp án/vi phạm liên quan. Học viên chỉ bắt đầu lại nếu kỳ thi vẫn Published, chưa đến hạn và enrollment còn Accepted; reset không gia hạn kỳ thi.

## 13. Xuất kết quả, chỉnh đáp án và chia sẻ ngân hàng

`components/examinations/examination-results.tsx` tải lần lượt toàn bộ trang kết quả (`GET /api/examinations/{id}/attempts`, pageSize=20), tạo XLSX bằng ExcelJS trong browser và tải Blob. Không có endpoint export hoặc file xuất lưu trên server; dữ liệu có thể thay đổi giữa các trang khi kỳ thi còn diễn ra.

`question-bank-workspace.tsx` gọi `PUT /api/questions/{id}` với tùy chọn options/answers/shuffleOptions để sửa đáp án, và `POST /api/question-banks/{id}/share` để sao chép cho Teacher Active khác. Admin/System chỉ đọc ngân hàng; backend trả ownerFullName/ownerEmail và hỗ trợ ownerSearch. Frontend tải bank cùng câu hỏi từng bank rồi lọc/hiển thị, nên có nhiều request khi bank lớn.

## 14. Dữ liệu nền và giới hạn tổng hợp

`exercise-workspace.tsx` có polling 15 giây ở nhánh theo dõi bài nộp để cập nhật điểm; không phải SignalR bài tập. Dashboard, trang `/exams` và chat ghép dữ liệu từ nhiều API. Một số trang lấy riêng trang 20 courses/enrollments đầu tiên; không coi các số liệu đó là tổng toàn hệ thống. Danh sách file gọi API ở [source-map.md](source-map.md), các vấn đề chưa sửa ở [review-findings.md](review-findings.md).
