# 📐 GHI CHÚ THIẾT KẾ & ÁNH XẠ TOKEN (DESIGN_NOTES.md)
> **Tài liệu sinh ra kèm `reference/index.html` theo chuẩn Prompt 09**

---

## 1. BẢNG DESIGN TOKENS TRONG BẢN VẼ
- `--primary: #4F46E5` -> Màu tím Indigo nhận diện
- `--accent: #F59E0B` -> Màu cam hổ phách cho badge giảm giá
- `--bg-body: #F8FAFC` -> Nền xám nhạt dịu mắt
- `--bg-surface: #FFFFFF` -> Nền card trắng nổi bật
- `--radius-card: 16px` -> Bo góc mềm mại cho Card
- `--radius-btn: 12px` -> Bo góc nút bấm

---

## 2. DANH SÁCH COMPONENT ĐÃ ĐỊNH NGHĨA (`data-component`)
1. `Navbar`: Thanh điều hướng đầu trang, chứa Logo, Menu và nút mở Giỏ hàng.
2. `ProductCatalog`: Khối chứa tiêu đề, bộ lọc danh mục (Pills) và lưới sản phẩm.
3. `ProductCard`: Thẻ sản phẩm chuẩn gồm Ảnh, Badge giảm giá, Thể loại, Tên SP, Đánh giá sao, Giá tiền và Nút thêm vào giỏ.
4. `Footer`: Chân trang với bản quyền và liên kết phụ.

---

## 3. CÁC TƯƠNG TÁC CẦN TRIỂN KHAI KHI SANG NEXT.JS
- Nút `pill` lọc danh mục: Chuyển state lọc sản phẩm tương ứng hoặc URL Query `?category=...`.
- Nút `btn-add` trên Card: Thêm sản phẩm vào Giỏ hàng toàn cục kèm hiệu ứng Toast thông báo.
- Nút `btn-cart` trên Navbar: Mở màn hình Giỏ hàng hoặc giỏ hàng Drawer.
- Click vào Card sản phẩm: Điều hướng sang trang Chi tiết sản phẩm (`/product/[id]`).
