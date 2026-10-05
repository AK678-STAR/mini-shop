# Nhật ký prompt #008 — Server Actions CRUD & Đặt hàng với ACID Transaction
- **Mục tiêu:** Xây dựng Server Actions quản lý sản phẩm (thêm, sửa, xóa) có xác thực dữ liệu qua Zod; Xây dựng Server Action đặt hàng (checkout) tạo Order + OrderItem trong một Database Transaction duy nhất, trừ tồn kho và lấy giá trực tiếp từ database.
- **Công cụ:** Antigravity, Next.js App Router Server Actions, Zod, Prisma Client `$transaction`.
- **Prompt đã dùng:**
  ```text
  [VAI TRÒ] Senior Backend Engineer.
  [NHIỆM VỤ] Viết Server Actions cho quản trị sản phẩm có Zod validation; Viết hàm createOrder nhận mảng giỏ hàng, mở prisma.$transaction để kiểm tra tồn kho, trừ tồn kho, tính tổng tiền từ giá thực tế trong DB (không tin giá từ client) và tạo Order + OrderItem đồng bộ.
  ```
- **Kết quả:** Đạt 100%. Giao dịch ACID đảm bảo tính toàn vẹn dữ liệu: nếu 1 sản phẩm hết hàng hoặc lỗi mạng thì toàn bộ giao dịch rollback, không phát sinh đơn hàng rác hay sai lệch tồn kho.
- **Lỗi gặp:** Nguy cơ Race Condition khi hai người dùng cùng đặt món hàng cuối cùng trong kho.
- **Cách vá:** Kiểm tra số lượng tồn kho `stock >= requestedQuantity` ngay trong transaction trước khi gọi lệnh `prisma.product.update({ data: { stock: { decrement: quantity } } })`.
- **Bài học:** Tuyệt đối không tin tưởng giá trị `price` hay `totalAmount` do client gửi lên; mọi phép tính giá và tiền phải lấy từ bản ghi gốc trong database.
