# 📋 TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD - PRODUCT REQUIREMENTS DOCUMENT)
# DỰ ÁN: MINI SHOP — CỬA HÀNG CÔNG NGHỆ & PHỤ KIỆN CAO CẤP

> **Phiên bản:** 2.0.0  
> **Trạng thái:** Đã nghiệm thu & Hoàn thiện mã nguồn  
> **Chủ sở hữu:** K1509 — Khóa học Vibe Coding (Web Fullstack với AI)  
> **Mục tiêu:** Xây dựng nền tảng thương mại điện tử tinh gọn (Mini Shop), hiện đại, tối ưu trải nghiệm người dùng (Light/Dark mode, Responsive), xác thực an toàn chuẩn RBAC và quy trình đặt hàng tin cậy.

---

## 1. TỔNG QUAN & TẦM NHÌN SẢN PHẨM (EXECUTIVE SUMMARY)

### 1.1. Bối cảnh thị trường & Vấn đề giải quyết
Người mua sắm công nghệ hiện đại yêu cầu trải nghiệm mua sắm nhanh, giao diện trực quan, hỗ trợ chế độ ban đêm (Dark Mode) bảo vệ mắt, thao tác giỏ hàng mượt mà không độ trễ, và bảo mật thông tin đơn hàng cá nhân tuyệt đối.  
**Mini Shop** ra đời nhằm giải quyết:
- **Tốc độ & Tính trực quan:** Tìm kiếm, lọc sản phẩm tức thì, xem chi tiết và cấu hình thông số kỹ thuật rõ ràng.
- **Thanh toán không rườm rà:** Quy trình đặt hàng ngắn gọn, hỗ trợ mã ưu đãi (`GIAM20`, `FREESHIP`), minh bạch hóa đơn.
- **Bảo mật & Cá nhân hóa:** Phân tách rõ ràng giữa khách vãng lai, khách đã đăng ký và quản trị viên cửa hàng.

### 1.2. Mục tiêu sản phẩm (Product Goals & KPIs)
- **Chuyển đổi mua sắm:** Quy trình từ duyệt sản phẩm đến hoàn tất đặt hàng $\le 3$ bước.
- **Khả năng tiếp cận (Accessibility):** Đạt chuẩn tương phản **WCAG 2.2 AA** ($\ge 4.5:1$).
- **Trải nghiệm trạng thái:** 100% các màn hình có đủ 3 trạng thái giao diện: *Loading Skeleton*, *Empty State*, và *Error State kèm nút thử lại*.
- **Toàn vẹn đơn hàng:** 100% đơn hàng được bảo toàn tính toàn vẹn giá (Price Snapshot) và ghi nhận giao dịch cơ sở dữ liệu an toàn.

---

## 2. CHÂN DUNG NGƯỜI DÙNG (USER PERSONAS)

| Vai trò | Mô tả | Nhu cầu chính | Thách thức / Rào cản |
| :--- | :--- | :--- | :--- |
| **Khách vãng lai (Guest)** | Người dùng duyệt web chưa tạo tài khoản | Xem danh mục sản phẩm, tìm kiếm, lọc giá, xem thông số kỹ thuật, thêm hàng vào giỏ tạm. | Ngại quy trình đăng ký phức tạp trước khi xem sản phẩm. |
| **Khách hàng thân thiết (Registered User)** | Khách hàng đã đăng ký & đăng nhập | Quản lý lịch sử đơn hàng cá nhân (`/account/orders`), theo dõi tiến độ đơn, áp mã giảm giá, lưu thông tin giao hàng. | Cần thông tin đơn hàng bảo mật, không bị lộ thông tin cho người khác. |
| **Quản trị viên (Admin)** | Chủ shop hoặc nhân viên quản lý | Quản lý danh mục, thêm/sửa/xóa sản phẩm (`/admin/products`), duyệt và đổi trạng thái đơn hàng (`/admin/orders`). | Cần thao tác nhanh, giao diện bảo mật nghiêm ngặt chống can thiệp trái phép. |

---

## 3. PHẠM VI SẢN PHẨM (PRODUCT SCOPE)

### Trong phạm vi (In-Scope):
1. Danh mục sản phẩm (Catalog) kèm bộ lọc đa tiêu chí, phân trang, tìm kiếm thời gian thực.
2. Chi tiết sản phẩm (Product Detail) với bộ sưu tập hình ảnh, chọn phân loại (Màu sắc, Dung lượng), bảng thông số kỹ thuật.
3. Giỏ hàng & Thanh toán (Cart & Checkout) với quản lý số lượng, áp mã giảm giá voucher, form thông tin giao hàng.
4. Xác thực tài khoản (Authentication) với Better Auth (Đăng ký, Đăng nhập, Đăng xuất, Session an toàn).
5. Trang tài khoản cá nhân: Xem danh sách và chi tiết đơn hàng đã mua.
6. Trang quản trị (Admin Dashboard): Quản lý sản phẩm và trạng thái đơn hàng (PENDING, PAID, SHIPPED, CANCELLED).
7. Hệ thống Design System đồng bộ Light/Dark Mode.

### Ngoài phạm vi (Out-of-Scope - Giai đoạn tương lai):
- Tích hợp cổng thanh toán trực tuyến bên thứ ba (VNPay, Momo, Stripe) — Giai đoạn này áp dụng phương thức COD / Chuyển khoản nội bộ.
- Đánh giá có upload video/hình ảnh thực tế từ người dùng.

---

## 4. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 4.1. Màn hình 1: Danh sách sản phẩm (Product Catalog - `/products`)
- **FR-1.1 (Hiển thị sản phẩm):** Danh sách dạng lưới (Grid) hiển thị thẻ sản phẩm gồm: Hình ảnh, Nhãn giảm giá (nếu có), Tên sản phẩm, Đánh giá sao, Giá khuyến mãi, Giá niêm yết gạch ngang, Tồn kho và Nút "Thêm vào giỏ".
- **FR-1.2 (Tìm kiếm):** Thanh tìm kiếm hỗ trợ lọc theo tên sản phẩm theo thời gian thực (debounce).
- **FR-1.3 (Bộ lọc danh mục):** Cho phép người dùng lọc theo Danh mục (Smartphone, Laptop, Phụ kiện, v.v.).
- **FR-1.4 (Lọc theo giá):** Lọc sản phẩm theo khoảng giá tối thiểu (`minPrice`) và tối đa (`maxPrice`).
- **FR-1.5 (Sắp xếp):** Sắp xếp theo: *Mới nhất*, *Giá tăng dần*, *Giá giảm dần*.
- **FR-1.6 (Chế độ xem):** Hỗ trợ chuyển đổi linh hoạt giữa giao diện Lưới (Grid View) và Danh sách (List View).
- **FR-1.7 (Trạng thái phụ trợ):**
  - Skeleton Loading hiển thị khi đang tải dữ liệu.
  - Empty State hiển thị thông điệp thân thiện khi không tìm thấy sản phẩm nào khớp bộ lọc.
  - Error State hiển thị nút "Thử lại" khi gặp lỗi tải dữ liệu.

### 4.2. Màn hình 2: Chi tiết sản phẩm (Product Detail - `/products/[slug]`)
- **FR-2.1 (Gallery hình ảnh):** Hiển thị ảnh chính chất lượng cao cùng danh sách ảnh thu nhỏ (thumbnails) cho phép bấm chuyển đổi ảnh.
- **FR-2.2 (Lựa chọn biến thể):** Cho phép khách hàng chọn Màu sắc (Color picker) và Dung lượng (Storage variant) của sản phẩm.
- **FR-2.3 (Thông số kỹ thuật):** Hệ thống phân tab rõ ràng giữa "Mô tả sản phẩm" và "Thông số kỹ thuật" (CPU, RAM, Màn hình, Pin...).
- **FR-2.4 (Điều chỉnh số lượng & Thêm giỏ):** Bộ chọn số lượng mua (Quantity Stepper $\ge 1$) và nút kích hoạt thêm vào giỏ hàng kèm thông báo phản hồi (Toast notification).
- **FR-2.5 (Xử lý không tìm thấy):** Trả về trang 404 (Not Found) chuyên biệt nếu `slug` sản phẩm không tồn tại.

### 4.3. Màn hình 3: Giỏ hàng & Quy trình thanh toán (Cart & Checkout Flow)
- **FR-3.1 (Ngăn kéo / Trang giỏ hàng):** Hiển thị danh sách món hàng đã chọn, đơn giá, nút tăng/giảm (+/-) số lượng, nút xóa từng món và nút xóa sạch giỏ hàng.
- **FR-3.2 (Mã ưu đãi / Voucher):**
  - Hỗ trợ mã `GIAM20`: Giảm 20% trên tổng giá trị hàng hóa.
  - Hỗ trợ mã `FREESHIP`: Miễn phí vận chuyển toàn quốc.
  - Tự động hiển thị số tiền được giảm rõ ràng trên hóa đơn.
- **FR-3.3 (Form thông tin giao hàng):** Thu thập họ tên người nhận, số điện thoại, địa chỉ nhận hàng và ghi chú đơn hàng. Có kiểm tra tính hợp lệ dữ liệu (Validation).
- **FR-3.4 (Tạo đơn hàng & Hóa đơn):** Khi khách bấm "Đặt hàng", hệ thống tạo đơn hàng trong cơ sở dữ liệu, hiển thị hóa đơn tóm tắt gồm Mã đơn hàng (`orderCode`), danh sách sản phẩm, địa chỉ giao hàng và tổng tiền phải trả.

### 4.4. Màn hình 4: Xác thực & Hồ sơ cá nhân (Auth & User Profile)
- **FR-4.1 (Đăng ký tài khoản - `/register`):** Khách hàng tạo tài khoản bằng Email, Mật khẩu và Tên hiển thị. Mặc định mọi tài khoản tạo mới luôn có vai trò `USER`.
- **FR-4.2 (Đăng nhập - `/login`):** Xác thực an toàn. Khi sai mật khẩu hoặc sai email, hiển thị thông báo lỗi chung để ngăn dò tài khoản.
- **FR-4.3 (Đăng xuất):** Hủy phiên làm việc và xóa cookie bảo mật.
- **FR-4.4 (Lịch sử đơn hàng cá nhân - `/account/orders`):** Người dùng chỉ được xem danh sách đơn hàng và chi tiết đơn hàng do chính mình tạo ra (Chống rò rỉ IDOR).

### 4.5. Màn hình 5: Quản trị hệ thống (Admin Portal)
- **FR-5.1 (Phân quyền truy cập):** Chỉ người dùng có vai trò `ADMIN` mới được phép truy cập vào khu vực `/admin/*`. Người dùng khác hoặc khách chưa đăng nhập bị chuyển hướng an toàn.
- **FR-5.2 (Quản lý sản phẩm - `/admin/products`):** Thêm mới sản phẩm, cập nhật thông tin (Tên, Giá, Giá gốc, Tồn kho, Mô tả, Specs, Danh mục), bật/tắt trạng thái kinh doanh (`isActive`), và xóa sản phẩm.
- **FR-5.3 (Quản lý đơn hàng - `/admin/orders`):** Xem toàn bộ đơn hàng của tất cả khách hàng, cập nhật trạng thái đơn (`PENDING` $\to$ `PAID` $\to$ `SHIPPED` $\to$ `CANCELLED`).

---

## 5. ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 5.1. Thiết kế Giao diện & Trải nghiệm Người dùng (UI/UX)
- **NFR-1 (Design Tokens):** 100% màu sắc, khoảng cách, bo góc tuân thủ hệ thống Design Tokens định nghĩa tại `DESIGN.md`.
- **NFR-2 (Dark Mode):** Hỗ trợ chuyển đổi Light/Dark mode mượt mà, lưu tùy chọn vào `localStorage`. Không xảy ra hiện tượng chớp nháy (Flash of unstyled content).
- **NFR-3 (Responsive Design):** Tương thích hoàn hảo từ màn hình di động nhỏ ($320\text{px}$), máy tính bảng ($768\text{px}$) đến màn hình máy tính bàn lớn ($1440\text{px}$).
- **NFR-4 (Accessibility WCAG 2.2 AA):**
  - Tỷ lệ tương phản màu chữ so với nền $\ge 4.5:1$.
  - Mọi nút bấm tương tác trên thiết bị di động có diện tích chạm tối thiểu $\ge 44 \times 44\text{px}$.
  - Hỗ trợ điều hướng bằng bàn phím (Focus visible đầy đủ).

### 5.2. Hiệu năng & Khả năng tải (Performance)
- **NFR-5 (Thời gian phản hồi):** Tải trang sản phẩm và lọc dữ liệu với độ trễ $\le 500\text{ms}$.
- **NFR-6 (Tối ưu cơ sở dữ liệu):** Triệt tiêu hoàn toàn lỗi truy vấn lặp $N+1$ (Số lượng truy vấn SQL khi tải trang $\le 2$).

### 5.3. Bảo mật ứng dụng (Security Requirements)
- **NFR-7 (Toàn vẹn giá):** Đơn giá sản phẩm khi tạo đơn hàng (`unitPrice`) phải được lưu độc lập tại thời điểm mua (Snapshot), ngăn chặn việc giá đơn hàng trong quá khứ bị thay đổi khi giá sản phẩm được cập nhật.
- **NFR-8 (Kiểm soát chuyển hướng - Safe Redirect):** Tham số `?next=` khi đăng nhập phải được kiểm duyệt nghiêm ngặt, từ chối Open Redirect (CWE-601).
- **NFR-9 (Bảo vệ phiên):** Phiên làm việc sử dụng Cookie `HttpOnly`, `SameSite: Lax`, ngăn chặn đánh cắp phiên qua XSS.
- **NFR-10 (Bảo vệ thao tác phía máy chủ):** Mọi Server Action can thiệp dữ liệu bắt buộc kiểm tra quyền (`guards.ts - Zero Trust`).

---

## 6. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Khách hàng vãng lai:** Có thể xem toàn bộ sản phẩm, tìm kiếm, lọc giá, xem chi tiết và thêm sản phẩm vào giỏ hàng.
2. **Khách hàng đăng ký:** Đăng nhập thành công, đặt hàng thành công nhận được mã đơn, xem lại lịch sử đơn hàng của mình tại `/account/orders`.
3. **Bảo mật phân quyền:** Tài khoản thường cố tình vào `/admin` hoặc gọi Server Action sửa sản phẩm lập tức bị từ chối và chặn đứng.
4. **Đơn hàng chuẩn xác:** Dữ liệu đơn hàng trong cơ sở dữ liệu ghi nhận đầy đủ bảng `Order` và `OrderItem` tương ứng với số tiền chính xác, không dùng số thực Float (toàn bộ tiền lưu dạng số nguyên VNĐ).
