import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/server/guards";

export const dynamic = "force-dynamic";

/**
 * TẦNG 2: Layout Quản Trị Cấp Cao (Next.js App Router)
 * Bắt buộc kiểm tra quyền ADMIN tại dòng đầu tiên bằng requireAdmin().
 * Mọi trang con thuộc /admin/* đều tự động thừa hưởng tầng bảo vệ này.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DÒNG BẢO VỆ ĐẦU TIÊN: Kiểm tra quyền ADMIN trung tâm
  const admin = await requireAdmin("/login?next=/admin/products");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Thanh điều hướng Quản trị (Admin Header Bar) */}
      <header
        style={{
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "14px 24px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link
              href="/admin/products"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>⚡</span>
              <span>
                Mini<span style={{ color: "#38bdf8" }}>Shop</span>{" "}
                <span
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: "#ef4444",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginLeft: "4px",
                  }}
                >
                  ADMIN
                </span>
              </span>
            </Link>

            <nav style={{ display: "flex", gap: "16px" }}>
              <Link
                href="/admin/products"
                style={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                📦 Sản phẩm
              </Link>
              <Link
                href="/admin/orders"
                style={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                🧾 Đơn hàng
              </Link>
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Xin chào, <strong style={{ color: "#f8fafc" }}>{admin.name || admin.email}</strong>
            </div>

            <Link
              href="/products"
              style={{
                fontSize: "0.85rem",
                color: "#38bdf8",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #0284c7",
              }}
            >
              Về cửa hàng ➔
            </Link>
          </div>
        </div>
      </header>

      {/* Nội dung trang quản trị */}
      <main style={{ padding: "32px 20px" }}>{children}</main>
    </div>
  );
}
