# Nhật ký prompt #004 — Dựng Màn hình 2: Chi tiết sản phẩm
- **Mục tiêu:** Xây dựng màn hình chi tiết sản phẩm gồm Breadcrumb, Thư viện ảnh Thumbnail có thể click đổi ảnh, bộ chọn màu sắc / dung lượng, tăng giảm số lượng, các tab thông số & đánh giá, và sản phẩm tương tự.
- **Công cụ:** Antigravity (Prompt 04)
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior UI/UX Developer.
  [MÀN HÌNH] Product Detail Page.
  [TÍNH NĂNG] Thư viện ảnh phóng to, variant pills (Màu, Dung lượng), nút "Thêm vào giỏ" và "Mua ngay", Tabs thông số kỹ thuật dạng bảng, Tabs đánh giá khách hàng.
  ```
- **Kết quả:** Tốt (Người dùng có thể bấm vào bất kỳ sản phẩm nào từ trang chủ để xem chi tiết và chọn phiên bản).
- **Lỗi gặp:** A5 (Quên trạng thái active khi chọn biến thể và thiếu phản hồi khi bấm nút thêm vào giỏ).
- **Cách vá:** Thêm class `.variant-pill.active`, cập nhật label tên màu/phiên bản theo thời gian thực và bắn Toast Notification khi thêm vào giỏ.
- **Bài học:** Các micro-interactions nhỏ như đổi ảnh thumbnail và toast thông báo làm tăng trải nghiệm người dùng (UX) rất nhiều.
