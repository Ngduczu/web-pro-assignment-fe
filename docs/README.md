# LMS Frontend – Tài liệu

Next.js 16 (App Router) + React 19 + Tailwind CSS 4. Mã nguồn tại thư mục gốc repo này (`app/`, `components/`, `lib/`, `types/`).

Đối chiếu **2026-10-13**, frontend base commit `0e772fb`; Next 16.4.0/React 19.3.0 theo package.json. Chỉ cập nhật tài liệu, không thay UI/API/logic.

- [overview.md](overview.md) – Công nghệ, chạy local, cấu trúc thư mục, route và phân quyền, i18n, theme.
- [api-integration.md](api-integration.md) – Next.js làm BFF, cookie phiên, tự refresh token, Google OAuth, SignalR, giám sát khi thi, import Excel.
- [supporting-features.md](supporting-features.md) – UI primitives, session/transport/errors, Excel import/export, guard/timers, i18n/theme, SEO và CI: làm gì, khi dùng, ai gọi.
- [source-map.md](source-map.md) – File theo thư mục, component/export và lời gọi clientApis/serverApis.
- [review-findings.md](review-findings.md) – Logic/tích hợp cần duyệt: refresh session, pagination, forwarding header; chưa sửa code.
- [Hồ sơ phục vụ báo cáo](../../backend/docs/project-report.md) – Tác nhân, use case, kiến trúc, dữ liệu, bảo mật, kiểm thử và giới hạn bằng chứng.
- [Công cụ backend](../../backend/docs/tools-and-integrations.md) · [Worker/logger/helpers](../../backend/docs/architecture/supporting-components.md) · [API index](../../backend/docs/api/endpoint-index.md) · [Contracts](../../backend/docs/api/contracts.md).

Tài liệu backend đầy đủ tại [mục lục backend](../../backend/docs/README.md). Link chéo giả định backend/frontend là hai thư mục sibling. Kiểm thử frontend hiện là lint/typecheck/build và browser riêng; không gọi đó là E2E đã chạy nếu chưa có kết quả.
