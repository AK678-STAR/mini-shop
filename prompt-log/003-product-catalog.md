# Nhật ký prompt #003 — Dựng Màn hình 1: Danh sách sản phẩm
- **Mục tiêu:** Xây dựng màn hình danh mục sản phẩm hoàn chỉnh với thanh tìm kiếm thời gian thực, lọc theo danh mục, lọc giá, sắp xếp và chuyển đổi Grid/List view.
- **Công cụ:** Antigravity (Prompt 04 & 10)
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Frontend Engineer.
  [BỐI CẢNH] Màn hình Product Catalog cho Mini Shop.
  [YÊU CẦU] Grid thẻ sản phẩm có ảnh, badge giảm giá, giá gốc/giá khuyến mãi, rating sao, nút Thêm vào giỏ. Hỗ trợ tìm kiếm và sắp xếp.
  ```
- **Kết quả:** Tốt (Giao diện hiển thị 8 sản phẩm công nghệ sắc nét, lọc danh mục tức thì).
- **Lỗi gặp:** A6 (Không tối ưu hiển thị thẻ sản phẩm trên mobile 375px bị cuộn ngang) và B4 (Nhảy layout khi ảnh tải).
- **Cách vá:** Đặt kích thước ảnh cố định `height: 220px; object-fit: cover;`, CSS Grid `repeat(auto-fill, minmax(260px, 1fr))`.
- **Bài học:** Luôn kiểm tra giao diện ở chiều rộng 375px ngay khi code xong component danh sách.
