import React from "react";
import Link from "next/link";
import { requireUser } from "@/server/guards";
import { getUserOrders } from "@/server/orders";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  // BẮT BUỘC: Kiểm tra đăng nhập tại Server Component
  const user = await requireUser(undefined, "/login?next=/account/orders");

  // Truy vấn đơn hàng bị ràng buộc theo userId của phiên hiện tại (Chống rò rỉ dữ liệu)
  const orders = await getUserOrders(user.id);

  const statusMap: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: "Chờ xử lý", bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    PAID: { label: "Đã thanh toán", bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    SHIPPED: { label: "Đã giao hàng", bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    CANCELLED: { label: "Đã hủy", bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
          📦 Đơn hàng của tôi
        </h1>
        <p style={{ color: "#64748b", marginTop: "4px" }}>
          Theo dõi lịch sử mua sắm và trạng thái các đơn hàng của tài khoản: <strong>{user.email}</strong>
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "56px 24px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <span style={{ fontSize: "3.5rem" }}>🛒</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e293b", marginTop: "16px" }}>
            Bạn chưa có đơn hàng nào
          </h2>
          <p style={{ marginTop: "6px", fontSize: "0.95rem" }}>
            Hãy khám phá các thiết bị công nghệ và phần mềm bản quyền hấp dẫn tại cửa hàng.
          </p>
          <Link
            href="/products"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 24px",
              borderRadius: "8px",
              backgroundColor: "var(--primary, #4f46e5)",
              color: "#ffffff",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Khám phá sản phẩm ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {orders.map((order) => {
            const st = statusMap[order.status] || statusMap.PENDING;

            return (
              <div
                key={order.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "22px 26px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "14px",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                      {order.orderCode}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", marginLeft: "10px" }}>
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        backgroundColor: st.bg,
                        color: st.text,
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      {st.label}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--primary, #4f46e5)",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: "#334155", fontWeight: "500" }}>
                        {item.product?.name || "Sản phẩm Mini Shop"} × {item.quantity}
                      </span>
                      <span style={{ color: "#64748b", fontWeight: "600" }}>
                        {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px dashed #e2e8f0",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Tổng cộng:</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary, #4f46e5)" }}>
                    {order.totalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
