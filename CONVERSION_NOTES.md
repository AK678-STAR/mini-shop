# 🗺️ BẢNG ÁNH XẠ CHUYỂN ĐỔI SANG NEXT.JS (CONVERSION_NOTES.md)
> **Thực hiện theo Giai đoạn 1 của Prompt 10 – Quy trình Antigravity chuyển đổi HTML sang Next.js**

---

## 1. BẢNG ÁNH XẠ COMPONENT (`reference/index.html` $\to$ `src/components/`)

| Tên `data-component` | File Component đích | Loại Component | Lý do chọn Server / Client |
| :--- | :--- | :---: | :--- |
| `Navbar` | `src/components/Navbar.jsx` | **Client Component** | Cần theo dõi tổng số lượng món trong giỏ hàng và mở giỏ hàng |
| `ProductCatalog` | `src/components/ProductCatalog.jsx` | **Client Component** | Chứa state tìm kiếm, bộ lọc danh mục và sắp xếp giá |
| `ProductCard` | `src/components/ProductCard.jsx` | **Client Component** | Có nút bấm "Thêm vào giỏ" (`onClick`) và chuyển hướng sang chi tiết |
| `ProductDetail` | `src/components/ProductDetail.jsx` | **Client Component** | Chọn biến thể màu sắc, dung lượng, đổi ảnh thumbnail |
| `CartCheckout` | `src/components/CartCheckout.jsx` | **Client Component** | Quản lý state giỏ hàng, áp dụng voucher giảm giá, form thanh toán 3 bước |
| `Footer` | `src/components/Footer.jsx` | **Server Component** | Nội dung tĩnh hoàn toàn, không có state tương tác |

---

## 2. QUY TẮC BẢO TOÀN THIẾT KẾ
1. **Style & CSS:** Ánh xạ 100% token từ `DESIGN.md` và `reference/index.html` vào CSS Variables trong `style.css`.
2. **Icons:** Thay thế placeholder bằng `lucide-react` / Lucide Icons đồng bộ.
3. **Data Layer:** Tách dữ liệu sản phẩm mẫu vào `src/lib/mock-data.ts` hoặc `src/utils/data.js`, tuyệt đối không hardcode lộn xộn trong component.
4. **Trạng thái:** Bổ sung Skeleton Loading, Empty State cho Giỏ hàng và Error Boundary cho các thao tác mạng.
