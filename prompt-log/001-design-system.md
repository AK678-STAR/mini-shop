# Nhật ký prompt #001 — Thiết lập Design System & Tokens
- **Mục tiêu:** Chốt hệ thống màu sắc, kiểu chữ, bo góc, bóng đổ và tiêu chuẩn WCAG 2.2 AA cho toàn bộ dự án Mini Shop trước khi dựng màn hình.
- **Công cụ:** Antigravity (Prompt 06)
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Lead Design System Engineer kiêm Accessibility Specialist.
  [BỐI CẢNH] Cửa hàng công nghệ Mini Shop, phục vụ khách hàng trẻ, tối ưu cả Light Mode và Dark Mode.
  [NHIỆM VỤ] Xuất file DESIGN.md gồm bảng màu (Primary, Accent, Background, Surface, Text), Spacing 4px, Radius, Shadows và tiêu chuẩn tương phản WCAG 2.2 AA >= 4.5:1.
  ```
- **Kết quả:** Tốt (Xuất ra đầy đủ file `DESIGN.md` có đầy đủ CSS variables cho cả Light/Dark mode).
- **Lỗi gặp:** A4 (Không có Design Tokens từ đầu dẫn đến việc mỗi màn hình dùng một mã màu hex khác nhau).
- **Cách vá:** Ràng buộc tất cả component chỉ được dùng biến CSS `--primary`, `--bg-surface`, `--text-main` thay vì mã màu trực tiếp.
- **Bài học:** Chốt Design Tokens từ đầu giúp giao diện đồng nhất 100% và chuyển đổi Dark Mode chỉ trong 1 dòng code.
