# Nhật ký prompt #007 — Thiết kế Prisma Schema, Migration & Seed Data
- **Mục tiêu:** Xây dựng cơ sở dữ liệu PostgreSQL cho Mini Shop với ít nhất 5 model quan hệ chặt chẽ: User, Category, Product, Order, OrderItem; thực hiện migration sạch và seed >= 24 sản phẩm thực tế.
- **Công cụ:** Antigravity, Prisma ORM, PostgreSQL (Neon Serverless).
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Database Architect.
  [NHIỆM VỤ] Thiết kế schema.prisma với 5 model chuẩn hoá 3NF: User (Better Auth tương thích), Category, Product (slug, price, stock, images), Order (orderCode, status, totalAmount), OrderItem (unitPrice, quantity). Thêm index trên slug, categoryId, status để tối ưu truy vấn. Viết seed.ts nạp 24 sản phẩm công nghệ thực tế.
  ```
- **Kết quả:** Đạt 100%. Migration `20261005_init` tạo sạch 5 bảng và các enum `Role`, `OrderStatus`. Seed thành công 4 danh mục và 24 sản phẩm.
- **Lỗi gặp:** Xung đột kiểu dữ liệu giữa Prisma DateTime và múi giờ PostgreSQL Neon.
- **Cách vá:** Chuẩn hóa toàn bộ trường thời gian về `DateTime @default(now())` và `@updatedAt`.
- **Bài học:** Đặt index sớm trên các trường tìm kiếm/lọc (`slug`, `categoryId`, `status`) giúp tối ưu hiệu năng ngay từ đầu và đạt điểm cộng tối ưu truy vấn.
