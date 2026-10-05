import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/guards";
import { getOrderById } from "@/server/orders";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage(props: OrderDetailPageProps) {
  const { id } = await props.params;

  // 1. Kiểm tra đăng nhập
  const currentUser = await requireUser(undefined, `/login?next=/account/orders/${id}`);

  // 2. Truy vấn an toàn với phòng thủ IDOR:
  // USER chỉ xem được đơn có { id, userId: currentUser.id }
  // ADMIN được xem mọi đơn
  const order = await getOrderById(id, currentUser);

  // 3. Nếu không tìm thấy hoặc đơn của người khác: Bắt buộc gọi notFound()
  // Tuyệt đối không trả về 403 Forbidden để tránh lộ sự tồn tại của đơn hàng (Anti-Enumeration)
  if (!order) {
    notFound();
  }

  const statusMap: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: "Chờ xử lý", bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    PAID: { label: "Đã thanh toán", bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    SHIPPED: { label: "Đã giao hàng", bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    CANCELLED: { label: "Đã hủy", bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  };

  const st = statusMap[order.status] || statusMap.PENDING;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px 48px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/account/orders"
          style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none" }}
        >
          ← Quay lại danh sách Đơn hàng
        </Link>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "32px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "20px",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Chi tiết đơn hàng</span>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
              {order.orderCode}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "4px" }}>
              Thời gian khởi tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "700",
                backgroundColor: st.bg,
                color: st.text,
                border: `1px solid ${st.border}`,
              }}
            >
              {st.label}
            </span>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div style={{ marginBottom: "24px", padding: "14px 18px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
            👤 Thông tin người đặt:
          </div>
          <div style={{ fontSize: "0.95rem", color: "#1e293b" }}>
            {order.user?.name || "Khách hàng"} ({order.user?.email})
          </div>
        </div>

        {/* Danh sách OrderItems */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", marginBottom: "14px" }}>
            Danh sách sản phẩm
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "#0f172a" }}>
                    {item.product?.name || "Sản phẩm"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
                    Đơn giá đóng băng: {item.unitPrice.toLocaleString("vi-VN")}₫ × {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "1rem" }}>
                  {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng thanh toán */}
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#334155" }}>
            Tổng tiền thanh toán:
          </span>
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary, #4f46e5)" }}>
            {order.totalAmount.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
    </div>
  );
}
