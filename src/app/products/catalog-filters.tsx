"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function CatalogFilters({
  categories,
  currentCategory,
  currentSort,
  currentQ,
}: {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  currentQ?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Khi đổi lọc hoặc tìm kiếm, reset về trang 1
    if (key !== "page") {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    updateParam("q", query);
  };

  const hasActiveFilters = Boolean(
    (currentCategory && currentCategory !== "all") || currentQ || (currentSort && currentSort !== "newest")
  );

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: "20px", display: "flex", gap: "12px", maxWidth: "600px" }}>
        <input
          type="text"
          name="q"
          defaultValue={currentQ || ""}
          placeholder="Tìm kiếm laptop, linh kiện, khóa học..."
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "var(--radius-btn)",
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            fontSize: "0.95rem",
            outline: "none",
            boxShadow: "var(--shadow-sm)",
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: "12px 24px",
            borderRadius: "var(--radius-btn)",
            border: "none",
            background: "var(--primary)",
            color: "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Tìm kiếm
        </button>
      </form>

      {/* Filters & Sorting Bar */}
      <div className="filters-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        {/* Category Filter Pills */}
        <div className="category-pills" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`pill-btn ${!currentCategory || currentCategory === "all" ? "active" : ""}`}
            onClick={() => updateParam("category", "all")}
          >
            ✨ Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`pill-btn ${currentCategory === c.slug ? "active" : ""}`}
              onClick={() => updateParam("category", c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="sort-wrapper">
          <select
            className="select-input"
            value={currentSort || "newest"}
            onChange={(e) => updateParam("sort", e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-main)",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            <option value="newest">⚡ Mới nhất</option>
            <option value="popular">🔥 Phổ biến nhất</option>
            <option value="price_asc">💵 Giá: Thấp đến Cao</option>
            <option value="price_desc">💎 Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      {/* Active Filter Strip */}
      {hasActiveFilters && (
        <div
          className="active-tags-strip"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "16px",
            padding: "8px 14px",
            background: "var(--bg-surface-secondary)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Đang lọc:</span>
          {currentCategory && currentCategory !== "all" && (
            <span className="filter-tag" style={{ background: "var(--primary-soft)", color: "var(--primary)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
              Danh mục: {currentCategory}
            </span>
          )}
          {currentQ && (
            <span className="filter-tag" style={{ background: "var(--primary-soft)", color: "var(--primary)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
              Từ khóa: &quot;{currentQ}&quot;
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.push(pathname);
              });
            }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--status-danger)",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            ✕ Xóa tất cả lọc
          </button>
        </div>
      )}

      {isPending && (
        <div style={{ fontSize: "0.8rem", color: "var(--primary)", marginTop: "8px" }}>
          Đang cập nhật danh sách...
        </div>
      )}
    </div>
  );
}
