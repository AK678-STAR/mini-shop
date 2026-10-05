import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/server/products";
import { ProductCard } from "../product-card";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  // Bất đồng bộ hóa params theo chuẩn Next.js 15+
  const { slug } = await props.params;

  // Truy vấn trực tiếp qua Data Access Layer
  const product = await getProductBySlug(slug);

  // Nếu không tìm thấy sản phẩm -> Gọi hàm chuẩn notFound() của Next.js
  if (!product) {
    notFound();
  }

  // Lấy các sản phẩm liên quan cùng danh mục
  const relatedProducts = await getRelatedProducts(product, 4);

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  const formattedOriginal = product.originalPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.originalPrice)
    : null;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          marginBottom: "28px",
        }}
      >
        <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{product.name}</span>
      </nav>

      {/* Main Detail Grid (2 Cột trên Desktop, 1 Cột trên Mobile) */}
      <div
        className="detail-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
          marginBottom: "64px",
          alignItems: "start",
        }}
      >
        {/* Cột trái: Gallery Ảnh */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-color)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <img
            src={product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop"}
            alt={product.name}
            style={{
              width: "100%",
              maxHeight: "440px",
              objectFit: "cover",
              borderRadius: "var(--radius-btn)",
            }}
          />
        </div>

        {/* Cột phải: Thông tin & Đặt hàng */}
        <div>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-soft)",
              color: "var(--primary)",
              fontSize: "0.85rem",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            {product.category.name}
          </span>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              color: "var(--text-main)",
              lineHeight: 1.3,
              marginBottom: "16px",
            }}
          >
            {product.name}
          </h1>

          {/* Hộp Giá & Trạng thái */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "var(--status-success)",
                  letterSpacing: "-0.5px",
                }}
              >
                {formattedPrice}
              </span>
              {formattedOriginal && (
                <span
                  style={{
                    fontSize: "1.125rem",
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formattedOriginal}
                </span>
              )}
              {discountPercent && (
                <span
                  style={{
                    padding: "3px 8px",
                    background: "var(--status-danger-soft)",
                    color: "var(--status-danger)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                  }}
                >
                  -{discountPercent}%
                </span>
              )}
            </div>

            <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trạng thái:{" "}
              <strong style={{ color: product.stock > 0 ? "var(--status-success)" : "var(--status-danger)" }}>
                {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Tạm hết hàng"}
              </strong>
            </div>
          </div>

          {/* Mô tả tóm tắt */}
          {product.description && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "8px" }}>Mô tả sản phẩm</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Bảng thông số kỹ thuật (specs) */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>
                Thông số kỹ thuật
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-btn)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.875rem",
                }}
              >
                <tbody>
                  {Object.entries(product.specs).map(([key, value], idx) => (
                    <tr
                      key={key}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background: idx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-surface-secondary)",
                      }}
                    >
                      <td style={{ padding: "10px 14px", fontWeight: "600", width: "40%", color: "var(--text-muted)" }}>
                        {key}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-main)", fontWeight: "500" }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nút hành động */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                flex: 1,
                padding: "14px 28px",
                borderRadius: "var(--radius-btn)",
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
              }}
            >
              Thêm vào giỏ hàng
            </button>
            <Link
              href="/products"
              style={{
                padding: "14px 20px",
                borderRadius: "var(--radius-btn)",
                border: "1px solid var(--border-color)",
                background: "var(--bg-surface)",
                color: "var(--text-main)",
                textDecoration: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
              }}
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </div>

      {/* Sản phẩm cùng danh mục */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: "1px solid var(--border-color)", paddingTop: "48px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "24px", color: "var(--text-main)" }}>
            Sản phẩm tương tự bạn có thể thích
          </h2>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
