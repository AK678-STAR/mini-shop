import "server-only";

import prisma from "@/lib/prisma";
import { OrderStatus, Role } from "@prisma/client";
import { SessionUser } from "./guards";

/**
 * 1. Lấy danh sách đơn hàng của người dùng hiện tại (USER)
 * Ràng buộc bảo mật: Bắt buộc lọc theo userId của người đang đăng nhập
 */
export async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 2. Lấy toàn bộ đơn hàng trong hệ thống (chỉ dành cho ADMIN)
 */
export async function getAllOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 3. Lấy chi tiết một đơn hàng theo ID (Phòng thủ IDOR - Insecure Direct Object Reference)
 * Quy tắc bảo mật:
 * - Nếu người gọi có role === "ADMIN": được phép xem mọi đơn hàng.
 * - Nếu người gọi là USER thông thường: BẮT BUỘC có điều kiện where: { id: orderId, userId: currentUser.id }.
 * - Nếu đơn hàng không thuộc về người dùng, hàm trả về null (trang sẽ gọi notFound() để không lộ sự tồn tại).
 */
export async function getOrderById(orderId: string, currentUser: SessionUser) {
  const whereClause =
    currentUser.role === Role.ADMIN
      ? { id: orderId }
      : { id: orderId, userId: currentUser.id };

  return await prisma.order.findFirst({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
    },
  });
}
