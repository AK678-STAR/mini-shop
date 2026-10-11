# ⚙️ TÀI LIỆU YÊU CẦU KỸ THUẬT (TRD - TECHNICAL REQUIREMENTS DOCUMENT)
# DỰ ÁN: MINI SHOP — HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ NEXT.JS & PRISMA ORM

> **Phiên bản:** 2.0.0  
> **Trạng thái:** Triển khai hoàn tất & Hoạt động ổn định  
> **Kiến trúc cốt lõi:** Next.js 16 App Router (React 19) • Prisma ORM • PostgreSQL 16 • Better Auth (RBAC) • TypeScript  

---

## 1. TỔNG QUAN KIẾN TRÚC KỸ THUẬT (SYSTEM ARCHITECTURE)

Hệ thống Mini Shop được xây dựng theo mô hình **Next.js Fullstack Server-Driven Architecture**, tận dụng khả năng của Server Components (RSC), Server Actions và Cơ sở dữ liệu quan hệ PostgreSQL với Prisma ORM.

```
                           +-------------------------------------+
                           |            Browser / Client         |
                           |  (React 19 Components / Dark Mode)  |
                           +------------------+------------------+
                                              |
                          HTTP / Cookie Auth  |  Server Action RPC
                                              v
                           +-------------------------------------+
                           |      Next.js 16 (App Router)        |
                           |  - Middleware / Proxy Guard         |
                           |  - React Server Components (RSC)    |
                           |  - Better Auth Handler (/api/auth)  |
                           |  - Server Actions (Zod Validate)    |
                           +------------------+------------------+
                                              |
                               Prisma ORM     | (Connection Pool)
                                              v
                           +-------------------------------------+
                           |      PostgreSQL 16 Database         |
                           |  - ACID Transactions                |
                           |  - Foreign Key Constraints          |
                           |  - Indexes for High Performance     |
                           +-------------------------------------+
```

### 1.1. Công nghệ sử dụng (Technology Stack)
- **Framework:** Next.js `16.3.8` (App Router).
- **Thư viện UI & Logic:** React `19.3.0`, React DOM `19.3.0`.
- **Ngôn ngữ:** TypeScript `5.5.0` (chế độ Strict Mode).
- **ORM (Object-Relational Mapping):** Prisma `5.22.0`.
- **Cơ sở dữ liệu:** PostgreSQL 16 (Hỗ trợ Connection Pooling qua `DATABASE_URL` và `DIRECT_URL`).
- **Xác thực & Phân quyền (Auth & RBAC):** `better-auth` `1.7.7`.
- **Xác thực dữ liệu (Data Validation):** `zod` `4.6.5`.
- **Đóng gói mã hóa & CSS:** CSS Variables thuần theo hệ thống Tokens tại `DESIGN.md`.
- **Môi trường chạy lệnh (CLI):** `tsx` `4.19.1`, Node.js `22.x`.

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU & ERD (DATABASE SCHEMA & ERD)

Toàn bộ lược đồ cơ sở dữ liệu được định nghĩa và quản lý chặt chẽ tại file [prisma/schema.prisma](file:///c:/Users/KHANH/Desktop/vicode/mini-shop/prisma/schema.prisma).

### 2.1. Sơ đồ thực thể quan hệ (ERD)

```mermaid
erDiagram
    User ||--o{ Session : "has many"
    User ||--o{ Account : "has many"
    User ||--o{ Order : "places"
    Category ||--o{ Product : "contains"
    Order ||--|{ OrderItem : "composed of"
    Product ||--o{ OrderItem : "referenced in"

    User {
        string id PK
        string email UK
        string name
        boolean emailVerified
        Role role "USER | ADMIN"
        datetime createdAt
    }

    Category {
        string id PK
        string name
        string slug UK
        string description
    }

    Product {
        string id PK
        string name
        string slug UK
        int price "VNĐ (Integer)"
        int originalPrice
        int stock
        boolean isActive
        json specs
        string categoryId FK
    }

    Order {
        string id PK
        string orderCode UK
        string userId FK
        OrderStatus status "PENDING | PAID | SHIPPED | CANCELLED"
        int totalAmount "VNĐ (Integer)"
        datetime createdAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int unitPrice "Snapshot Price VNĐ"
        int quantity
    }
```

### 2.2. Chi tiết các bảng & Quy tắc dữ liệu (Data Rules)
1. **Quy tắc tiền tệ:** Tuyệt đối **không sử dụng kiểu số thực (Float)** cho giá trị tiền tệ để tránh lỗi sai số dấu phẩy động. Toàn bộ các trường `price`, `originalPrice`, `totalAmount`, `unitPrice` được lưu trữ dưới dạng **Số nguyên (Int)** theo đơn vị Việt Nam Đồng (VNĐ).
2. **Bảo toàn lịch sử giá (Price Snapshotting):** Bảng `OrderItem` lưu độc lập trường `unitPrice` tại thời điểm mua. Khi giá sản phẩm `Product.price` thay đổi trong tương lai, hóa đơn cũ hoàn toàn không bị ảnh hưởng.
3. **Chính sách khóa ngoại & Ràng buộc toàn vẹn:**
   - `Order.userId` $\to$ `User.id`: `onDelete: Restrict` (Không được xóa tài khoản người dùng nếu đang có đơn hàng trong lịch sử).
   - `OrderItem.productId` $\to$ `Product.id`: `onDelete: Restrict` (Không được xóa cứng sản phẩm nếu đã có đơn hàng từng mua).
   - `OrderItem.orderId` $\to$ `Order.id`: `onDelete: Cascade` (Khi hủy/xóa đơn hàng, các dòng chi tiết đơn hàng tương ứng được dọn dẹp).
4. **Hệ thống Index phục vụ hiệu năng:**
   - `Product`: Đánh index trên `categoryId`, `price`, `createdAt`, và composite index `[isActive, createdAt]`.
   - `Order`: Đánh index trên `userId`, `status`, `createdAt`.

---

## 3. THIẾT KẾ XÁC THỰC & BẢO MẬT (AUTH & SECURITY MATRIX)

Được thiết kế theo nguyên lý **Phòng thủ đa tầng (Defense in Depth)** và ghi nhận chi tiết tại [AUTH_NOTES.md](file:///c:/Users/KHANH/Desktop/vicode/mini-shop/AUTH_NOTES.md).

### 3.1. Cấu hình Better Auth & RBAC
- File cấu hình: `src/lib/auth.ts` và `src/lib/auth-client.ts`.
- Mở rộng bảng người dùng bằng trường `role` với giá trị mặc định là `"USER"`.
- **Chống leo thang đặc quyền (Privilege Escalation):** Cấu hình `user.additionalFields.role` với `input: false`. Khi đăng ký qua `/api/auth/sign-up`, mọi trường `role` client cố tình gửi kèm đều bị loại bỏ ngay tại tầng xử lý auth.

### 3.2. Cổng bảo vệ Zero-Trust (Server Guards)
File `src/server/guards.ts` cung cấp các hàm chốt chặn bảo vệ Server Actions và Data Access Layer:
- `requireUserSession()`: Kiểm tra phiên đăng nhập hợp lệ từ Request Headers. Trả về thông tin User hoặc ném ngoại lệ lỗi.
- `requireAdminSession()`: Bắt buộc phiên phải có `role === "ADMIN"`. Từ chối lập tức nếu là khách hoặc user thông thường.
- `authorize(action, session)`: Đóng vai trò Policy Decision Point cho từng hành động nghiệp vụ.

### 3.3. Ma trận phòng thủ an ninh ứng dụng

| Vector tấn công | Rủi ro | Giải pháp kỹ thuật triển khai | File xử lý |
| :--- | :--- | :--- | :--- |
| **Open Redirect (CWE-601)** | Kẻ tấn công lừa nạn nhân redirect sang trang phishing sau đăng nhập | Sử dụng `getSafeRedirectUrl()`, chỉ chấp nhận đường dẫn tương đối bắt đầu bằng 1 dấu `/`, chặn `//`, `/\`, scheme lạ. | `src/lib/safe-redirect.ts` |
| **User Enumeration** | Hacker gửi thử email để biết email nào đã đăng ký qua thông báo lỗi | Chuẩn hóa thông báo lỗi đăng nhập: Luôn trả về `"Email hoặc mật khẩu chưa đúng."` cho cả trường hợp sai email lẫn sai pass. | `src/app/(auth)/login/page.tsx` |
| **IDOR (Truy cập đơn hàng trái phép)** | User A xem/sửa đơn hàng của User B bằng cách đổi `orderId` | Mọi truy vấn `getOrderById` hoặc cập nhật đều có điều kiện ràng buộc `WHERE id = orderId AND userId = currentUserId`. | `src/server/orders.ts` |
| **Brute-Force Login** | Dò quét mật khẩu tự động | Bật tính năng Rate Limit trên Better Auth: Tối đa 10 lần thử trong 60 giây. | `src/lib/auth.ts` |
| **CSRF / Session Hijack** | Đánh cắp phiên đăng nhập qua JavaScript độc hại (XSS) | Lưu phiên trong Cookie có cờ `HttpOnly: true`, `SameSite: "lax"`, `Secure: true`. | Better Auth Engine |

---

## 4. SERVER ACTIONS & GIAO DỊCH DATABASE (ACID TRANSACTIONS)

### 4.1. Quy trình đặt hàng an toàn (Order Placement Flow)
File xử lý: `src/app/actions/order.ts` và `src/server/orders.ts`.
1. **Kiểm tra phiên:** Gọi `requireUserSession()` xác thực người dùng.
2. **Xác thực dữ liệu đầu vào:** Dùng Zod Schema kiểm tra danh sách sản phẩm, số lượng ($> 0$), thông tin người nhận.
3. **Thực thi Prisma Transaction (`prisma.$transaction`):**
   - Đọc danh sách sản phẩm trong kho (`SELECT FOR UPDATE` / kiểm tra tồn kho `stock >= requestedQuantity`).
   - Khóa giá hiện tại của sản phẩm vào biến `unitPrice`.
   - Tính tổng tiền `totalAmount = sum(unitPrice * quantity) - discount`.
   - Tạo bản ghi `Order` và các bản ghi `OrderItem`.
   - Trừ số lượng tồn kho `Product.stock`.
4. Nếu bất kỳ bước nào thất bại, toàn bộ giao dịch được Rollback tự động.

### 4.2. Quản trị sản phẩm (Admin Product Actions)
File xử lý: `src/app/actions/product.ts`.
- `upsertProductAction`: Kiểm tra `requireAdminSession()`. Validate dữ liệu qua `productSchema` (Zod). Thực hiện tạo hoặc cập nhật sản phẩm.
- `deleteProductAction`: Kiểm tra quyền Admin. Kiểm tra sản phẩm có dính `OrderItem` hay không; nếu đã có đơn hàng thì chuyển trạng thái `isActive = false` thay vì xóa cứng gây lỗi khóa ngoại.

---

## 5. PHÂN RÃ COMPONENT & CHIẾN LƯỢC RENDERING

Tuân thủ chiến lược chia tách Server Component và Client Component để đạt hiệu năng tải cao nhất (Zero Client Bundle cho dữ liệu tĩnh):

| Thành phần / Tuyến đường | Loại Component | Vai trò & Trách nhiệm |
| :--- | :---: | :--- |
| `src/app/products/page.tsx` | **Server Component** | Đọc dữ liệu trực tiếp từ Prisma, xử lý searchParams, render HTML tĩnh kèm SEO tags. |
| `src/app/products/catalog-filters.tsx` | **Client Component** | Xử lý tương tác: Tìm kiếm Debounce, chọn danh mục, kéo thanh giá, cập nhật URL searchParams. |
| `src/app/products/product-card.tsx` | **Client Component** | Hiển thị nút "Thêm vào giỏ", bắn sự kiện cập nhật giỏ hàng. |
| `src/app/products/[slug]/page.tsx` | **Server Component** | Truy vấn chi tiết sản phẩm theo slug, ném `notFound()` nếu không tồn tại. |
| `src/app/admin/*` | **Server / Client** | Trang quản trị: Server Components đọc danh sách, Client Forms xử lý tương tác submit. |
| `src/components/navbar-auth.tsx` | **Client Component** | Lắng nghe trạng thái đăng nhập thời gian thực, hiển thị Avatar hoặc nút Đăng nhập/Đăng xuất. |

---

## 6. CHIẾN LƯỢC KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN (TESTING STRATEGY)

Hệ thống tích hợp các bộ kiểm thử tự động toàn diện:

1. **Unit Test Logic Giỏ hàng (`tests/cart.test.js` & `tests/test_cart.py`):**
   - Kiểm tra giỏ hàng rỗng.
   - Kiểm tra tính toán Subtotal khi tăng/giảm số lượng.
   - Kiểm tra áp dụng mã giảm giá voucher (`GIAM20` - giảm 20%, `FREESHIP`).
2. **Kiểm thử Truy vấn chống lỗi N+1 (`tests/query_count.test.ts`):**
   - Đảm bảo khi tải trang sản phẩm danh mục, số lượng câu truy vấn SQL gửi tới cơ sở dữ liệu luôn $\le 2$.
3. **Kiểm thử Bảo mật & Xâm nhập tự động (`scripts/verify-security-scenarios.ts`):**
   - Kịch bản 1: Thử truy cập trái phép route `/admin` khi chưa có quyền $\to$ Phải bị chặn.
   - Kịch bản 2: Gọi trực tiếp Server Action ghi dữ liệu mà không có cookie phiên $\to$ Bị từ chối.
   - Kịch bản 3: Thử tiêm tham số Open Redirect (`?next=https://malicious.com`) $\to$ Trả về `/products`.
   - Kịch bản 4: Đăng nhập sai email / sai mật khẩu $\to$ Nhận thông báo chung không lộ thông tin.

---

## 7. HƯỚNG DẪN MÔI TRƯỜNG & VẬN HÀNH (DEVOPS & OPERATIONS)

### 7.1. Cấu hình biến môi trường (`.env`)
```bash
# Kết nối PostgreSQL (Neon Serverless Pool)
DATABASE_URL="postgresql://user:password@ep-host-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-host.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Khóa bí mật Better Auth & Đường dẫn URL
BETTER_AUTH_SECRET="your-super-secret-random-key"
BETTER_AUTH_URL="http://localhost:3000"

# Tài khoản Quản trị viên (Khởi tạo tự động)
ADMIN_EMAIL="admin@minishop.vn"
ADMIN_PASSWORD="AdminSecurePassword123!"
```

### 7.2. Các câu lệnh vận hành chính
```bash
# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Đồng bộ lược đồ cơ sở dữ liệu
npx prisma db push

# 3. Nạp dữ liệu mẫu (24+ sản phẩm & danh mục)
npm run seed

# 4. Tạo hoặc cập nhật tài khoản Admin từ biến môi trường
npm run db:admin

# 5. Kiểm tra tính toàn vẹn cơ sở dữ liệu
npm run db:check

# 6. Chạy bộ kiểm thử kịch bản bảo mật
npm run test:security

# 7. Khởi động môi trường phát triển
npm run dev
```
