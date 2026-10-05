import React from "react";
import Link from "next/link";
import { requireUser } from "@/server/guards";
import { getAllOrders } from "@/server/orders";
import { Role } from "@prisma/client";
import { OrderStatusSelector } from "./order-status-selector";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // BẮT BUỘC: Kiểm tra quyền ADMIN ngay tại Server Component
  await requireUser(Role.ADMIN, "/login?next=/admin/orders");

  const orders = await getAllOrders();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/admin/products"
              style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none" }}
            >
              ← Quay lại Quản trị Sản phẩm
            </Link>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            🧾 Quản lý Đơn hàng Toàn hệ thống
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Theo dõi đơn hàng của toàn bộ khách hàng và cập nhật trạng thái đơn (Chỉ dành cho ADMIN).
          </p>
        </div>

        <div style={{ padding: "8px 16px", backgroundColor: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a", color: "#92400e", fontWeight: "700", fontSize: "0.875rem" }}>
          Tổng số: {orders.length} đơn hàng
        </div>
      </div>

      {/* Orders List / Table */}
      {orders.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <span style={{ fontSize: "3rem" }}>📦</span>
          <p style={{ marginTop: "12px", fontSize: "1.1rem", fontWeight: "600" }}>Chưa có đơn hàng nào trong hệ thống.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "14px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>
                      {order.orderCode}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      • {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#475569", marginTop: "4px" }}>
                    Khách hàng: <strong>{order.user?.name || "Chưa đặt tên"}</strong> ({order.user?.email})
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Tổng tiền thanh toán</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#4f46e5" }}>
                      {order.totalAmount.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
                  <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Mặt hàng đã đặt ({order.orderItems.length})
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.product?.name || "Sản phẩm không xác định"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {item.unitPrice.toLocaleString("vi-VN")}₫ × {item.quantity} = {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
