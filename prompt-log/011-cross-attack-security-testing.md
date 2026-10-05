# Nhật ký prompt #011 — Bộ Kịch bản Kiểm tra Truy cập Trái phép & Tấn công Chéo
- **Mục tiêu:** Xây dựng bộ kịch bản kiểm thử tự động (>= 6 kịch bản) mô phỏng các hành vi truy cập trái phép và đánh giá ma trận 8 hạng mục tấn công chéo theo chuẩn bảo mật ứng dụng web.
- **Công cụ:** Antigravity, TypeScript test runner (`scripts/verify-security-scenarios.ts`, `scripts/security-audit-evaluation.ts`).
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Application Security Engineer.
  [NHIỆM VỤ] Viết kịch bản kiểm tra tự động 8 hạng mục tấn công chéo:
  1. Truy cập /admin khi chưa đăng nhập.
  2. USER thông thường truy cập /admin.
  3. Replay Server Action sau khi đã đăng xuất.
  4. Regular USER gọi lén các Server Action của ADMIN (xoá sản phẩm, cập nhật trạng thái đơn).
  5. Thay đổi ID đơn hàng trên URL (IDOR).
  6. Gửi role='ADMIN' khi đăng ký tài khoản mới.
  7. Open Redirect qua tham số ?next= với //evil.com, /\\evil.com, control characters.
  8. Dò mật khẩu brute-force và rò rỉ hash trong session.
  ```
- **Kết quả:** Đạt 100% (8/8 kịch bản kiểm thử tự động vượt qua xuất sắc). Toàn bộ Server Action chặn đứng yêu cầu trái phép ngay tại dòng đầu tiên bằng `authorize()`.
- **Lỗi gặp:** Hàm chuyển hướng ban đầu chấp nhận đường dẫn chứa ký tự điều khiển ASCII `\0` hoặc bắt đầu bằng `/\`.
- **Cách vá:** Chuẩn hóa hàm `safeNextPath` với biểu thức chính quy từ chối `[\x00-\x1F\x7F]`, `//`, `/\`, `:` và fallback nghiêm ngặt về `/`.
- **Bài học:** Nguyên tắc Zero-trust: Middleware / Proxy chỉ là tầng lọc sớm cải thiện UX; ranh giới bảo mật thực sự bắt buộc phải nằm ở Server Component (`requireUser`) và Server Action (`authorize`) sát tầng dữ liệu.
