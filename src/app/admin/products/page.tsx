import React from "react";
import Link from "next/link";
import { requireUser } from "@/server/guards";
import { Role } from "@prisma/client";
import { getAdminProducts, getCategories } from "@/server/products";
import { ProductForm } from "./product-form";
import { DeleteProductButton } from "./delete-button";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function AdminProductsPage(props: AdminProductsPageProps) {
  // 1. Kiểm tra xác thực & phân quyền ADMIN tại Server Component
  await requireUser(Role.ADMIN, "/login?next=/admin/products");

  const searchParams = props.searchParams ? await props.searchParams : {};
  const page = Math.max(1, Number(searchParams?.page) || 1);

  // Truy vấn thông qua Service Layer (tránh query trực tiếp trong UI component và có phân trang)
  const [categories, { products, total, totalPages }] = await Promise.all([
    getCategories(),
    getAdminProducts({ page, pageSize: 20 }),
  ]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
          📦 Quản trị Danh mục & Sản phẩm Mini Shop
        </h1>
        <p style={{ color: "#64748b", marginTop: "4px" }}>
          Thêm mới, sửa đổi và theo dõi ràng buộc đơn hàng (Zero-trust Server Validation & Prisma ORM).
        </p>
      </div>

      {/* Grid: Form bên trên */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          marginBottom: "36px",
        }}
      >
        <ProductForm categories={categories} />
      </div>

      {/* Danh sách sản phẩm hiện có */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a" }}>
            📋 Danh sách sản phẩm ({total} sản phẩm)
          </h2>
          <span
            style={{
              padding: "4px 12px",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            Trang {page} / {totalPages}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569", fontSize: "0.85rem" }}>
                <th style={{ padding: "12px 16px" }}>Sản phẩm</th>
                <th style={{ padding: "12px 16px" }}>Danh mục</th>
                <th style={{ padding: "12px 16px" }}>Giá bán (VNĐ)</th>
                <th style={{ padding: "12px 16px" }}>Tồn kho</th>
                <th style={{ padding: "12px 16px" }}>Đơn hàng</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    Chưa có sản phẩm nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: "0.9rem",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{p.name}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "2px" }}>
                        /{p.slug}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "#f1f5f9",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          color: "#334155",
                        }}
                      >
                        {p.category.name}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "#047857" }}>
                      {p.price.toLocaleString("vi-VN")}₫
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          color: p.stock > 0 ? "#0f172a" : "#ef4444",
                          fontWeight: p.stock > 0 ? "500" : "700",
                        }}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {p._count.orderItems > 0 ? (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "#fef3c7",
                            color: "#b45309",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                          }}
                        >
                          {p._count.orderItems} đơn (Đang dùng)
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>0 đơn</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang Admin */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {page > 1 && (
              <Link
                href={`/admin/products?page=${page - 1}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                ← Trang trước
              </Link>
            )}
            <span style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 12px" }}>
              Trang {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/products?page=${page + 1}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Trang sau →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
