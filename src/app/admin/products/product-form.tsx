"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { createProduct } from "@/app/actions/product";
import { ActionResponse } from "@/lib/validators/product";

interface CategoryOption {
  id: string;
  name: string;
}

export function ProductForm({ categories }: { categories: CategoryOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    createProduct,
    null
  );

  useEffect(() => {
    if (state?.ok && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", color: "#0f172a" }}>
        ✨ Thêm sản phẩm công nghệ mới
      </h2>

      {/* Thông báo kết quả / lỗi chung */}
      {state?.message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "0.9rem",
            fontWeight: "500",
            backgroundColor: state.ok ? "#ecfdf5" : "#fef2f2",
            color: state.ok ? "#065f46" : "#991b1b",
            border: `1px solid ${state.ok ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {state.ok ? "🎉 " : "⚠️ "}
          {state.message}
          {state.code && (
            <span
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "700",
                backgroundColor: state.ok ? "#d1fae5" : "#fee2e2",
                color: state.ok ? "#047857" : "#b91c1c",
              }}
            >
              Mã lỗi: {state.code}
            </span>
          )}
        </div>
      )}

      <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Tên sản phẩm */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
            Tên sản phẩm <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Ví dụ: MacBook Pro 16 M3 Max 36GB"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${state?.fieldErrors?.name ? "#ef4444" : "#cbd5e1"}`,
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          {state?.fieldErrors?.name && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
            Slug (Định danh URL) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="slug"
            placeholder="vi-du: macbook-pro-16-m3-max"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${state?.fieldErrors?.slug ? "#ef4444" : "#cbd5e1"}`,
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          {state?.fieldErrors?.slug && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        {/* Hàng 2 cột: Giá & Tồn kho */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
              Giá bán (VNĐ) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="number"
              name="price"
              id="inputPrice"
              placeholder="35000000"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: `1px solid ${state?.fieldErrors?.price ? "#ef4444" : "#cbd5e1"}`,
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            {state?.fieldErrors?.price && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
                {state.fieldErrors.price[0]}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
              Số lượng tồn kho <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="number"
              name="stock"
              placeholder="20"
              defaultValue="10"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: `1px solid ${state?.fieldErrors?.stock ? "#ef4444" : "#cbd5e1"}`,
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            {state?.fieldErrors?.stock && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
                {state.fieldErrors.stock[0]}
              </p>
            )}
          </div>
        </div>

        {/* Danh mục */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
            Danh mục sản phẩm <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="categoryId"
            required
            defaultValue={categories[0]?.id || ""}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${state?.fieldErrors?.categoryId ? "#ef4444" : "#cbd5e1"}`,
              fontSize: "0.95rem",
              background: "#ffffff",
              outline: "none",
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.categoryId && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
              {state.fieldErrors.categoryId[0]}
            </p>
          )}
        </div>

        {/* URL Ảnh */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
            Đường dẫn ảnh sản phẩm (URL)
          </label>
          <input
            type="url"
            name="image"
            placeholder="https://images.unsplash.com/photo-..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${state?.fieldErrors?.image ? "#ef4444" : "#cbd5e1"}`,
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          {state?.fieldErrors?.image && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" }}>
              {state.fieldErrors.image[0]}
            </p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px" }}>
            Mô tả sản phẩm
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Mô tả tóm tắt tính năng, cấu hình..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>

        {/* Nút gửi - Bị vô hiệu hoá khi pending để chống bấm đúp */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            marginTop: "8px",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: isPending ? "#93c5fd" : "#2563eb",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isPending ? (
            <>
              <span>⏳</span> Đang lưu sản phẩm...
            </>
          ) : (
            <>
              <span>➕</span> Thêm sản phẩm
            </>
          )}
        </button>
      </form>
    </div>
  );
}
