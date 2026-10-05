# Nhật ký prompt #010 — Tích hợp Better Auth, Phân quyền RBAC & Khởi tạo Admin
- **Mục tiêu:** Xây dựng hệ thống xác thực an toàn (đăng ký, đăng nhập, đăng xuất) bằng Better Auth v1.7 tích hợp Prisma Adapter và phân quyền RBAC (Role-Based Access Control) cho USER và ADMIN.
- **Công cụ:** Antigravity, Better Auth, Next.js App Router, Prisma ORM.
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Backend kiêm Application Security Engineer.
  [NHIỆM VỤ] Triển khai Better Auth với Prisma adapter; Cấu hình model User có trường role với input: false để chặn client tự gán quyền; Xây dựng form đăng nhập/đăng ký có thông báo lỗi chung chung (tránh User Enumeration); Viết script create-admin.ts đọc ADMIN_EMAIL và ADMIN_PASSWORD từ biến môi trường, tuyệt đối không hardcode mật khẩu trong git.
  ```
- **Kết quả:** Đạt 100%. 
  - Đăng ký tự động băm mật khẩu scrypt an toàn trong DB.
  - Thông báo đăng nhập sai thống nhất: "Email hoặc mật khẩu chưa đúng".
  - Script `npm run admin:create` khởi tạo tài khoản quản trị viên an toàn từ `.env`.
- **Lỗi gặp:** Xung đột cookie phiên giữa Server Action và Route Handler trong Next.js 16.
- **Cách vá:** Tích hợp plugin `nextCookies()` của Better Auth để tự động đồng bộ session cookie qua HTTP response headers.
- **Bài học:** Không tự băm mật khẩu hay tự quản lý JWT thủ công trong localStorage; sử dụng giải pháp chuẩn với HttpOnly cookie giúp phòng chống triệt để tấn công XSS đánh cắp phiên.
