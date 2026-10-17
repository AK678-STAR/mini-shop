import React from "react";
import Link from "next/link";
import { parseProductUrlParams, RawProductSearchParams } from "@/lib/product-url-params";
import {
  fetchProductsViaSupabase,
  fetchCategoriesViaSupabase,
} from "@/lib/products-supabase";
import { CatalogFilters } from "./catalog-filters";
import { ProductCard } from "./product-card";

export const dynamic = "force-dynamic";

/**
 * Next.js 16 (App Router):
 * searchParams là một Promise theo chuẩn Next.js 15+, bắt buộc dùng `await props.searchParams`.
 */
interface ProductsPageProps {
  searchParams: Promise<RawProductSearchParams>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  // 1. Bất đồng bộ hóa searchParams theo quy chuẩn Next.js 16
  const rawSearchParams = await props.searchParams;

  // 2. Chuẩn hoá các tham số URL bằng hàm thuần parseProductUrlParams (Giai đoạn 1)
  const params = parseProductUrlParams(rawSearchParams);

  // 3. Truy vấn Supabase bằng publishable key (kích thước trang 12, không N+1, whitelist sort)
  const [categories, result] = await Promise.all([
    fetchCategoriesViaSupabase(),
    fetchProductsViaSupabase(params),
  ]);

  const { products, total, totalPages, page } = result;

  // Chuẩn bị query object để giữ nguyên các bộ lọc khi chuyển trang
  const currentQuery: Record<string, string> = {};
  if (params.q) currentQuery.q = params.q;
  if (params.category && params.category !== "all") currentQuery.category = params.category;
  if (params.sort && params.sort !== "newest") currentQuery.sort = params.sort;
  if (params.min !== null) currentQuery.min = String(params.min);
  if (params.max !== null) currentQuery.max = String(params.max);

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
        currentCategory={params.category}
        currentSort={params.sort}
        currentQ={params.q}
      />

      {/* Grid danh sách sản phẩm hoặc Empty State */}
      {products.length === 0 ? (
        <div className="state-card" data-component="EmptyState">
          <div className="state-icon">🔍</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "420px", margin: "0 auto 20px" }}>
            Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử chọn danh mục khác hoặc xóa bộ lọc.
          </p>
          <div className="state-actions">
            <Link
              href="/products"
              className="btn-primary"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: "var(--radius-btn)",
                background: "var(--primary)",
                color: "#ffffff",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Xóa tất cả bộ lọc
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
                    query: { ...currentQuery, page: page - 1 },
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
                    query: { ...currentQuery, page: page + 1 },
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
