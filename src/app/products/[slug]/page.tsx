import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/server/products";
import { ProductCard } from "../product-card";
import { SafeImage } from "@/components/ui/safe-image";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Sinh Metadata SEO kỹ thuật động theo chuẩn Next.js 16:
 * - Title, Description, Canonical URL, OpenGraph
 * - Ngăn chặn lập chỉ mục (noindex) nếu sản phẩm không tồn tại
 * - Dùng getProductBySlug bọc trong React.cache() để không tốn thêm truy vấn DB
 */
export async function generateMetadata(
  props: ProductDetailPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | Mini Shop",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mini-shop-q7ejctkn4-k0978.vercel.app"
  ).replace(/\/$/, "");

  const canonicalUrl = `${baseUrl}/products/${product.slug}`;
  const rawDesc =
    product.description ||
    `Mua ngay ${product.name} chính hãng 100%, bảo hành uy tín tại Mini Shop.`;
  const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, "").slice(0, 160).trim();

  return {
    title: `${product.name} | Mini Shop`,
    description: cleanDesc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: `${baseUrl}/products/${product.slug}`,
        en: `${baseUrl}/en/products/${product.slug}`,
      },
    },
    openGraph: {
      title: `${product.name} | Mini Shop`,
      description: cleanDesc,
      url: canonicalUrl,
      siteName: "Mini Shop",
      locale: "vi_VN",
      type: "website",
      images: product.image
        ? [
            {
              url: product.image,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

/**
 * Làm sạch chuỗi JSON-LD để chống tấn công XSS / Breakout thẻ <script>
 * Thay thế ký tự "<" thành "\u003c" an toàn theo chuẩn W3C
 */
export function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
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

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mini-shop-q7ejctkn4-k0978.vercel.app"
  ).replace(/\/$/, "");

  // Cấu trúc dữ liệu có cấu trúc Schema.org/Product
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : [],
    description: product.description || product.name,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "VND",
      price: Math.round(product.price), // Tiền số nguyên VNĐ
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
      {/* Schema.org Structured Data (Đã làm sạch ký tự < để chống XSS) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(productJsonLd) }}
      />

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
            position: "relative",
            minHeight: "360px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SafeImage
            src={product.image || ""}
            alt={product.name}
            width={600}
            height={440}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "440px",
              objectFit: "cover",
              borderRadius: "var(--radius-btn)",
            }}
            priority={true}
            sizes="(max-width: 768px) 100vw, 50vw"
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
