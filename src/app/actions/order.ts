"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { authorize } from "@/server/guards";
import { OrderStatus, Role } from "@prisma/client";
import { z } from "zod";
import { safeLogError } from "@/lib/logger";

const OrderItemInputSchema = z.object({
  productId: z.string().trim().min(1, "Mã sản phẩm không được rỗng"),
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng mua tối thiểu là 1")
    .max(100, "Số lượng mua tối đa cho mỗi mục là 100"),
});

const CreateOrderInputSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1, "Đơn hàng phải chứa ít nhất 1 sản phẩm"),
});

export interface OrderActionResponse<T = unknown> {
  ok: boolean;
  message?: string;
  code?: "UNAUTHENTICATED" | "FORBIDDEN" | "INVALID_INPUT" | "NOT_FOUND" | "OUT_OF_STOCK" | "UNKNOWN";
  data?: T;
}

/**
 * 1. ĐẶT HÀNG (createOrder)
 * Ma trận quyền: USER hoặc ADMIN đã đăng nhập
 * 
 * NGUYÊN TẮC BẢO MẬT & ZERO-TRUST:
 * 1. Gọi authorize() ở dòng đầu tiên để lấy session người dùng.
 * 2. userId lấy trực tiếp từ session, TUYỆT ĐỐI không nhận từ client.
 * 3. Client chỉ gửi danh sách { productId, quantity }.
 * 4. Giá và tổng tiền tính lại 100% từ Database; loại bỏ mọi trường giá client cố tình gửi.
 * 5. Trừ tồn kho và tạo đơn được gói trong 1 Database Transaction nguyên tử (Atomic Transaction).
 */
export async function createOrder(
  rawInput: unknown
): Promise<OrderActionResponse<{ orderId: string; orderCode: string; totalAmount: number }>> {
  // DÒNG ĐẦU TIÊN: Kiểm tra quyền xác thực (USER hoặc ADMIN)
  const auth = await authorize();
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  // Lấy userId trực tiếp từ session đã xác thực
  const verifiedUserId = auth.user.id;

  // Validate danh sách mặt hàng client gửi lên
  const parsed = CreateOrderInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Dữ liệu giỏ hàng chưa hợp lệ. Vui lòng kiểm tra lại.",
    };
  }

  const { items } = parsed.data;

  try {
    // Thực thi trong Transaction để bảo đảm tính toàn vẹn (ACID)
    const newOrder = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        unitPrice: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        // Truy vấn giá và tồn kho thực tế từ Database (Chống tấn công Tampering Price)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        });

        if (!product || !product.isActive) {
          throw new Error(`NOT_FOUND:${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${product.name} (còn ${product.stock} sản phẩm)`);
        }

        // Tính tiền bằng giá DB (VNĐ)
        const lineTotal = product.price * item.quantity;
        calculatedTotal += lineTotal;

        orderItemsToCreate.push({
          productId: product.id,
          unitPrice: product.price, // Đóng băng giá thời điểm mua
          quantity: item.quantity,
        });

        // Trừ tồn kho sản phẩm trong Transaction
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Tạo mã đơn hàng ngẫu nhiên duy nhất
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderCode = `ORD-${Date.now()}-${randomSuffix}`;

      // Tạo bản ghi Order và OrderItem
      const created = await tx.order.create({
        data: {
          orderCode,
          userId: verifiedUserId, // Gán userId từ session
          totalAmount: calculatedTotal, // Tổng tiền tính từ DB
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItemsToCreate,
          },
        },
      });

      return {
        orderId: created.id,
        orderCode: created.orderCode,
        totalAmount: created.totalAmount,
      };
    });

    // Làm mới cache các trang liên quan
    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/products");

    return {
      ok: true,
      message: "Đặt hàng thành công!",
      data: newOrder,
    };
  } catch (error: any) {
    const errorMsg = error?.message || "";

    if (errorMsg.startsWith("NOT_FOUND:")) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Một số sản phẩm trong đơn hàng không còn tồn tại hoặc đã ngừng kinh doanh.",
      };
    }

    if (errorMsg.startsWith("OUT_OF_STOCK:")) {
      const details = errorMsg.replace("OUT_OF_STOCK:", "");
      return {
        ok: false,
        code: "OUT_OF_STOCK",
        message: `Số lượng đặt mua vượt quá tồn kho hiện có: ${details}. Vui lòng giảm số lượng.`,
      };
    }

    safeLogError("Lỗi khi tạo đơn hàng", error);
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Hệ thống gặp sự cố khi xử lý đơn hàng. Vui lòng thử lại sau.",
    };
  }
}

/**
 * 2. ĐỔI TRẠNG THÁI ĐƠN HÀNG (updateOrderStatus)
 * Ma trận quyền: CHỈ ADMIN
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderActionResponse> {
  // DÒNG ĐẦU TIÊN: Bắt buộc quyền ADMIN
  const auth = await authorize(Role.ADMIN);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  if (!orderId || !Object.values(OrderStatus).includes(newStatus)) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Mã đơn hàng hoặc trạng thái cần cập nhật không hợp lệ.",
    };
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderCode: true },
    });

    if (!existingOrder) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Không tìm thấy đơn hàng cần cập nhật.",
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");

    return {
      ok: true,
      message: `Đã cập nhật trạng thái đơn hàng [${existingOrder.orderCode}] sang ${newStatus}.`,
    };
  } catch (error) {
    safeLogError("Lỗi khi cập nhật trạng thái đơn hàng", error);
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.",
    };
  }
}
