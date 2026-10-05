# AUTH_NOTES.md — Ghi chú Kiến trúc & Điểm điều chỉnh Xác thực (Mini Shop)

Tài liệu ghi nhận chi tiết triển khai xác thực, phân quyền (RBAC) với **Better Auth 1.7.7**, Next.js 16 App Router, và Prisma ORM trên Neon PostgreSQL 16.

---

## 1. Các điểm điều chỉnh so với Kế hoạch ban đầu (Theo chỉ đạo của User)

| Điểm thiết kế | Kế hoạch ban đầu (Phase 1) | Thực tế triển khai (Phase 2) | Lý do bảo mật / Kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Khởi tạo tài khoản ADMIN** | Seed mật khẩu mặc định qua `prisma/seed.ts`. | Tạo script chuyên biệt `scripts/create-admin.ts` (`npm run db:admin`), đọc `ADMIN_EMAIL` & `ADMIN_PASSWORD` từ `.env`. | **Bảo mật tuyệt đối**: Không hardcode thông tin đăng nhập admin trong mã nguồn hoặc file seed commit lên repo. |
| **Tên bảng PostgreSQL** | Sử dụng `@@map("user")`, `@@map("session")`. | Giữ nguyên model `User`, `Session`, `Account`, `Verification` chuẩn Prisma delegate (`prisma.user`, `prisma.session`...). | **Tránh mất dữ liệu**: PostgreSQL phân biệt hoa thường khi dùng trích dẫn (`"User"`). Bỏ `@@map("user")` giữ nguyên vẹn dữ liệu đơn hàng và quan hệ ngoại khóa hiện hữu. |
| **Bảo vệ Server Actions** | Auth guard dạng giả lập dev/prod. | Kiểm tra thực tế phiên đăng nhập (`auth.api.getSession`) với headers & kiểm tra `session.user.role === "ADMIN"`. | **Zero-trust**: Chặn đứng mọi request giả mạo hoặc gọi thẳng từ client không có quyền ADMIN. |

---

## 2. Ma trận phòng thủ 5 vector tấn công (Application Security)

1. **Tự phong ADMIN khi đăng ký (Privilege Escalation)**:
   - Thiết lập `user.additionalFields.role` với `input: false` và `defaultValue: "USER"` trong `src/lib/auth.ts`.
   - Toàn bộ tham số `role` gửi lên từ client đều bị Better Auth loại bỏ trước khi ghi vào database.

2. **Dò email qua thông báo lỗi (User Enumeration)**:
   - Khi đăng nhập sai email HOẶC sai mật khẩu, server và form đều trả về thông điệp đồng nhất: `"Email hoặc mật khẩu chưa đúng."`.
   - Kẻ tấn công không thể phân biệt email có tồn tại trong hệ thống hay không.

3. **Chuyển hướng nguy hiểm (Open Redirect - CWE-601)**:
   - Module `src/lib/safe-redirect.ts` kiểm duyệt tham số `?next=`.
   - Bắt buộc bắt đầu bằng một dấu `/` duy nhất; từ chối `//evil.com`, `/\evil.com`, `https://...`, `javascript:...`. Nếu vi phạm, tự động quay về `/products`.

4. **Dò mật khẩu hàng loạt (Brute-force / Credential Stuffing)**:
   - Kích hoạt `rateLimit: { enabled: true, window: 60, max: 10 }` trên Better Auth.

5. **Trộm phiên bằng XSS (Session Hijacking)**:
   - Cookie phiên do Better Auth quản lý mặc định có cờ `HttpOnly: true` (JavaScript trình duyệt không thể đọc được qua `document.cookie`), `SameSite: "lax"`, và `Secure: true` ở production.

---

## 3. Lệnh vận hành

- **Kiểm tra cơ sở dữ liệu**: `npm run db:check`
- **Tạo/cập nhật tài khoản Admin**: `npm run db:admin`
- **Seed dữ liệu mẫu (Sản phẩm & Danh mục)**: `npm run seed`
- **Build kiểm thử**: `npm run build`
