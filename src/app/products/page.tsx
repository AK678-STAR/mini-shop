import React from "react";
import Link from "next/link";
import { listProducts, getCategories } from "@/server/products";
import { CatalogFilters } from "./catalog-filters";
import { ProductCard } from "./product-card";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    category?: string;
    sort?: "popular" | "price_asc" | "price_desc" | "newest";
  }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  // Bất đồng bộ hóa searchParams theo chuẩn Next.js 15+
  const searchParams = await props.searchParams;

  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const q = searchParams.q;
  const category = searchParams.category;
  const sort = searchParams.sort;

  // Gọi trực tiếp Data Access Layer (Không fetch qua HTTP tự gọi mình)
  const [categories, result] = await Promise.all([
    getCategories(),
    listProducts({ page, pageSize, q, category, sort }),
  ]);

  const { products, total, totalPages } = result;

  return (
    <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
      {/* Catalog Hero */}
      <div className="catalog-hero" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Khám Phá Thiết Bị & Khóa Học Công Nghệ</h1>
          <p className="page-subtitle">
            Hàng chính hãng 100%, bảo hành chuẩn hãng, khóa học thực chiến chuẩn quốc tế ({total} sản phẩm).
          </p>
        </div>
      </div>

      {/* Bộ lọc & Sắp xếp URL SearchParams */}
      <CatalogFilters
        categories={categories}
        currentCategory={category}
        currentSort={sort}
        currentQ={q}
      />

      {/* Grid danh sách sản phẩm hoặc Empty State */}
      {products.length === 0 ? (
        <div className="state-card" data-component="EmptyState">
          <div className="state-icon">🔍</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto" }}>
            Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử chọn danh mục khác hoặc xóa bộ lọc.
          </p>
          <div className="state-actions">
            <Link
              href="/products"
              className="btn-primary"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: "var(--radius-btn)",
                background: "var(--primary)",
                color: "#ffffff",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              className="pagination"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "48px",
              }}
            >
              {page > 1 && (
                <Link
                  href={{
                    pathname: "/products",
                    query: { ...searchParams, page: page - 1 },
                  }}
                  className="pill-btn"
                  style={{ textDecoration: "none" }}
                >
                  ← Trang trước
                </Link>
              )}

              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 12px", fontWeight: "600" }}>
                Trang {page} / {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={{
                    pathname: "/products",
                    query: { ...searchParams, page: page + 1 },
                  }}
                  className="pill-btn"
                  style={{ textDecoration: "none" }}
                >
                  Trang sau →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
