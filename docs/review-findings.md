# Các vấn đề frontend chưa thay đổi

Rà soát tĩnh ngày **2026-10-13**; chỉ cập nhật tài liệu. Đây là vấn đề logic/tích hợp cần duyệt trước khi sửa theo AGENTS.md, không phải yêu cầu redesign UI. Backend proposals nằm [tại đây](../../backend/docs/review-findings.md).

## FE-01 — Duy trì phiên bằng refresh cookie

- **Current behavior:** getCurrentUser trả null khi thiếu access cookie. Khi request backend trả 401, serverBackendRequest rotate refresh; setAuthCookies nuốt lỗi ghi cookie. Không có single-flight refresh giữa các request đồng thời.
- **Why it appears incorrect:** access cookie hết hạn có thể đưa user về login dù refresh vẫn còn; refresh thành công trong ngữ cảnh không ghi được cookie có thể consume token cũ mà browser không nhận token mới; nhiều request cùng dùng một refresh one-time có thể cạnh tranh.
- **Proposed behavior:** khôi phục phiên qua đường ghi cookie được phép khi chỉ còn refresh, điều phối rotation, phân biệt phiên hết hạn với lỗi hạ tầng; test reload/hết hạn/parallel requests. Không refresh trong ngữ cảnh không thể chuyển token mới về browser.
- **Files affected:** `lib/auth/session.ts`, `lib/api/server-client.ts`, `lib/api/session-route.ts`, `app/api/auth/*`, caller liên quan.
- **Backend dependency:** giữ contract refresh rotation hiện tại; nếu cần retry/idempotency server vượt contract hiện có phải xin duyệt backend riêng.
- **Risk:** vòng lặp redirect, mất phiên hoặc phát token trùng; cần test với cookie thật và backend thật. Chưa tái hiện browser trong lần docs.

## FE-02 — Danh sách tổng hợp bị giới hạn ở trang đầu

- **Current behavior:** `/exams`, `examinations-workspace`, `/chat` gọi courses pageSize=20 và chỉ lấy items đối với Teacher/Admin/System. Course management lấy enrollments pageSize=20 và bỏ metadata phân trang. Các dashboard có cách tổng hợp khác nhau; teacher-home đã dùng listAllPages.
- **Why it appears incorrect:** người dùng có >20 course/enrollment có thể không thấy đủ lựa chọn hoặc hàng cần thao tác; nếu trình bày là “toàn bộ” sẽ gây hiểu sai.
- **Proposed behavior:** phân trang UI hoặc tải các trang cần thiết theo mục đích, giữ query filters và quyền; xác định rõ số liệu sample so với tổng. Tránh chỉ tăng pageSize rồi coi là đủ.
- **Files affected:** `app/(dashboard)/exams/page.tsx`, `components/examinations/examinations-workspace.tsx`, `app/(dashboard)/chat/page.tsx`, `app/(dashboard)/courses/[courseId]/page.tsx`, `components/courses/course-management-panel.tsx`; rà dashboard liên quan.
- **Backend dependency:** API đã có page/pageSize/totalPages; chưa cần endpoint mới để sửa việc bỏ trang. API aggregate chỉ là tối ưu riêng nếu dữ liệu lớn.
- **Risk:** tăng số request, chạm rate limit, thứ tự cập nhật và dữ liệu biến động giữa các trang.

## FE-03 — Proxy không bảo toàn đầy đủ header download/cache

- **Current behavior:** BFF generic chuyển Content-Type/Cookie request, vài response header và Set-Cookie; chưa chuyển Range/If-Range/Content-Range hay Cache-Control/Pragma của backend. Backend file controller nhận download nhưng luôn trả filename.
- **Why it appears incorrect:** client không thể dựa vào BFF để giữ range/cache semantics giống gọi backend trực tiếp; nhận Accept-Ranges không có nghĩa proxy thực hiện end-to-end range.
- **Proposed behavior:** xác định allowlist header phù hợp và test range/caching/OAuth redirect. Muốn thay đổi download flag ở backend cần proposal/approval riêng, không sửa ngầm trong proxy.
- **Files affected:** `app/api/backend/[...path]/route.ts`, `lib/api/transport.ts`, `lib/api/server-client.ts`.
- **Backend dependency:** backend đã bật range processing (còn phụ thuộc stream seekability); giữ contract file hiện tại cho tới khi có duyệt khác.
- **Risk:** forward quá nhiều header có thể lộ thông tin hoặc sai caching; cần test 200/206/416, Content-Length, auth và Set-Cookie.

## Ghi chú trải nghiệm và khả năng quan sát

Excel import là nhiều request độc lập, giới hạn parser 200/500 dòng; phần dư không được xử lý. UI vẫn dùng confirm/prompt ở một số action. Một số component/provider không được mount trong app hiện tại. Metadata chủ yếu tiếng Việt, i18n UI dùng cả dictionary và copy cục bộ. Các điểm này được ghi rõ ở [supporting-features](supporting-features.md); chưa refactor hoặc thay hành vi.
