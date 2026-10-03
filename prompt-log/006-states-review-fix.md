# Nhật ký prompt #006 — Phủ trạng thái, Đánh giá UI/UX & Vá lỗi
- **Mục tiêu:** Bổ sung trọn bộ 3 trạng thái giao diện (Loading Skeleton, Empty State, Error State) theo Prompt 11; Chạy đánh giá Accessibility & Responsive theo Prompt 12 và tinh chỉnh vá lỗi theo Prompt 13.
- **Công cụ:** Antigravity (Prompts 11, 12, 13)
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] QA Frontend kiêm Accessibility Specialist.
  [NHIỆM VỤ] Bổ sung Skeleton Loading giả lập, Empty state khi giỏ hàng rỗng, Error state khi mất kết nối mạng. Kiểm tra độ tương phản WCAG 2.2 AA, touch targets >= 44x44px và bàn phím navigation.
  ```
- **Kết quả:** Xuất sắc (Điểm đánh giá UI/UX đạt 95/100, vượt ngưỡng yêu cầu >= 85 điểm).
- **Lỗi gặp:** A5 (Quên trường hợp người dùng xóa hết giỏ hàng bị trắng trang) và B7 (Nút icon thiếu aria-label).
- **Cách vá:** Thêm view Empty Cart với nút "Khám phá sản phẩm ngay", thêm `aria-label` cho tất cả các nút icon.
- **Bài học:** Không bao giờ bàn giao một giao diện chỉ có "Happy Path" (trạng thái đẹp nhất); các trạng thái rỗng và đang tải mới là thứ người dùng thật tiếp xúc nhiều nhất.
