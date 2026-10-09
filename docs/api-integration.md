# Frontend – Tích hợp API backend

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

Liên kết Google cho tài khoản đang đăng nhập dùng `oauthLinkAuthorize("Google")`.

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
| F12, Ctrl+Shift+I/J/C/K, Ctrl+U, kích thước cửa sổ bất thường | `DevToolsSuspected` | `detectDevTools` |
| Thoát fullscreen | `ExitFullscreen` kèm `durationSeconds` | `requireFullscreen` |

Mỗi vi phạm gọi `POST /api/backend/examination-attempts/{attemptId}/violations?violationType=...`. Khi rời trang, `fetch(..., { keepalive: true })` gọi `.../disconnect`. Backend vẫn là nơi đếm vi phạm, áp `maxViolations` và tự nộp bài; frontend chỉ phát hiện và báo. Hook cũng khóa phím Escape bằng Keyboard Lock (Chromium) khi fullscreen và chặn PrintScreen.

Luồng thi: trang kỳ thi → `start` → `/exam-attempts/{examinationId}` (yêu cầu attempt `InProgress`/`Disconnected`, nếu không sẽ chuyển về trang kỳ thi) → lưu đáp án từng câu → `submit`. Reload gọi `my-attempt` để khôi phục, `Disconnected` thì gọi `reconnect`.

## 9. Import câu hỏi từ Excel

`lib/questions-excel.ts` + `components/questions/question-import-dialog.tsx` đọc file `.xlsx` bằng `exceljs` ở trình duyệt (tối đa 500 dòng, có tải file mẫu), chuyển thành request `multiple-choice`/`fill-in-blank` và gọi từng endpoint question-bank (xem `docs/api/question-banks.md` trong repo backend).
