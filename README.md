# 🛍️ BÁO CÁO BÀI TẬP VỀ NHÀ BUỔI 4: MINI SHOP
> **Môn học:** Vibe Coding – Web Fullstack với AI  
> **Học viên:** K1509  
> **Dự án:** Mini Shop (3 Màn Hình + Dark Mode + Unit Test + 3 Trạng Thái)

---

## 🌟 1. DANH SÁCH HỒ SƠ DỰ ÁN THEO YÊU CẦU GIÁO ÁN

1. **`DESIGN.md`:** Hệ thống Design System & Tokens hoàn chỉnh chốt từ Prompt 06.
2. **`reference/`:**
   - `index.html`: Bản vẽ HTML prototype có gắn `data-component` theo Prompt 09.
   - `DESIGN_NOTES.md`: Bảng token và ghi chú tương tác từ bản vẽ.
3. **`CONVERSION_NOTES.md`:** Kế hoạch ánh xạ và phân chia Server/Client component theo Prompt 10.
4. **`src/`:** Mã nguồn ứng dụng Mini Shop:
   - **Màn hình 1:** Danh sách sản phẩm (Tìm kiếm, lọc danh mục, lọc giá, sắp xếp, Grid/List view).
   - **Màn hình 2:** Chi tiết sản phẩm (Gallery ảnh, chọn Màu/Dung lượng, tabs thông số kỹ thuật, đánh giá).
   - **Màn hình 3:** Giỏ hàng & Thanh toán 3 bước (Quản lý số lượng, áp dụng mã `GIAM20`/`FREESHIP`, Form giao hàng có validation, Modal hóa đơn đặt hàng).
   - **Dark Mode:** Nút chuyển đổi Dark/Light mode thời gian thực lưu vào `localStorage`.
   - **3 Trạng thái:** Loading Skeleton, Empty State, Error State kèm nút thử lại.
5. **`tests/`:** Bộ Unit Test kiểm thử logic tính tiền giỏ hàng (`cart.test.js` & `test_cart.py`).
6. **`prompt-log/`:** Đủ 6 file nhật ký prompt chuẩn mẫu giáo án (Vượt mốc yêu cầu $\ge 5$ mục).

---

## 🚀 2. HƯỚNG DẪN CHẠY DỰ ÁN TRÊN MÁY LOCAL

### Chạy kiểm thử Unit Test (Điểm cộng):
Mở terminal tại thư mục dự án và chạy:
```bash
python tests/test_cart.py
```
*(Hoặc `node tests/cart.test.js` nếu đã cài Node.js)*  
👉 Kết quả: **100% Tests Passed** (Kiểm tra giỏ hàng rỗng, subtotal, voucher %, freeship).

### Chạy ứng dụng web trên Localhost:
Mở terminal tại thư mục `src/` và chạy:
```bash
python -m http.server 3000
```
Sau đó mở trình duyệt truy cập: **`http://localhost:3000`**

---

## 📸 3. HƯỚNG DẪN CHỤP ẢNH NỘP BÀI
- **Ảnh 1 (Desktop 1280px):** Chụp Màn hình 1 (Danh sách sản phẩm) và Màn hình 2 (Chi tiết sản phẩm).
- **Ảnh 2 (Mobile 375px):** Mở DevTools (F12 -> Bấm icon Mobile -> Chọn iPhone SE/14 375px) chụp Màn hình Giỏ hàng & Thanh toán.
- **Ảnh 3 (Dark Mode / Test):** Chụp giao diện Dark Mode hoặc màn hình kết quả chạy Unit Test.
