# Nhật ký prompt #005 — Dựng Màn hình 3: Giỏ hàng & Thanh toán 3 bước
- **Mục tiêu:** Xây dựng quy trình Giỏ hàng và luồng thanh toán 3 bước (1. Xem giỏ hàng -> 2. Nhập thông tin & chọn phương thức thanh toán -> 3. Hoàn tất & nhận hóa đơn điện tử).
- **Công cụ:** Antigravity (Prompt 05)
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Fullstack UX Engineer.
  [MÀN HÌNH] Cart & Checkout Flow 3 bước.
  [YÊU CẦU] Quản lý số lượng (+ / -), xóa món, áp dụng mã voucher GIAM20/FREESHIP, validation form thông tin giao hàng và hiển thị modal hóa đơn đặt hàng thành công.
  ```
- **Kết quả:** Tốt (Tính toán tiền chính xác, form có kiểm tra hợp lệ số điện thoại và địa chỉ).
- **Lỗi gặp:** B1 (Logic tính toán giỏ hàng bị trộn lẫn trực tiếp trong component khó kiểm thử unit test).
- **Cách vá:** Tách toàn bộ hàm tính tiền và voucher thành module thuần `src/utils/cart.js`, sau đó viết bộ test tự động trong `tests/cart.test.js`.
- **Bài học:** Tách biệt UI và Business Logic giúp code sạch sẽ, không có lỗi tiềm ẩn và đạt điểm cộng kiểm thử tự động.
