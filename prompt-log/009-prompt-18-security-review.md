# Nhật ký prompt #009 — Đánh giá & Vá lỗi Bảo mật (Prompt 18 Security Review)
- **Mục tiêu:** Rà soát mã nguồn toàn diện theo Prompt 18, phát hiện và vá ít nhất 3 lỗi bảo mật ở mức Nghiêm trọng (Critical/High) hoặc Trung bình (Medium).
- **Công cụ:** Antigravity, Security Audit Script (`scripts/security-audit-evaluation.ts`).
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Application Security Reviewer.
  [NHIỆM VỤ] Kiểm tra 8 hạng mục tấn công chéo: IDOR đơn hàng, leo thang đặc quyền khi đăng ký (role escalation), Open Redirect qua ?next=, rò rỉ password hash / user enumeration, và bypass phân quyền Server Action. Báo cáo bằng chứng thực tế và vá triệt để.
  ```
- **Kết quả & 3 Lỗi Nghiêm trọng / Trung bình đã được phát hiện và vá:**
  1. **Lỗi 1 (Mức Nghiêm trọng - IDOR Đơn hàng):** Người dùng có thể xem đơn hàng của người khác chỉ bằng cách thay đổi ID trên URL `/account/orders/[id]`.
     - *Cách vá:* Sửa hàm `getOrderById(orderId, userId)` bắt buộc thêm điều kiện `where: { id: orderId, userId: sessionUser.id }` nếu không phải là ADMIN.
  2. **Lỗi 2 (Mức Nghiêm trọng - Tự phong ADMIN):** Client có thể chèn `role: "ADMIN"` vào body request đăng ký Better Auth.
     - *Cách vá:* Cấu hình `user.additionalFields.role.input: false` trong `auth.ts`, máy chủ cưỡng chế giá trị mặc định là `"USER"`.
  3. **Lỗi 3 (Mức Trung bình - Open Redirect qua ?next):** URL chuyển hướng chấp nhận protocol-relative `//evil.com` hoặc backslash `/\evil.com`.
     - *Cách vá:* Xây dựng hàm `safeNextPath(input)` từ chối mọi URL bắt đầu bằng `//`, `/\`, chứa dấu `:`, hoặc ký tự điều khiển ASCII, fallback nghiêm ngặt về `"/"`.
- **Bài học:** Kiểm tra phân quyền phải luôn nằm ở phía server tại dòng đầu tiên của Server Action và sát tầng dữ liệu (Data Layer), không được chỉ tin tưởng vào middleware hay giao diện frontend.
