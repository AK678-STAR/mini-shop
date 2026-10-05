"use client";

import React, { useEffect } from "react";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi log lỗi nội bộ phía server/client mà không để lộ chi tiết nhạy cảm
    console.error("Products Page Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <div className="state-card error-card">
        <div className="state-icon-danger">
          <span style={{ fontSize: "1.75rem" }}>⚠️</span>
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
          Đã có sự cố khi tải dữ liệu sản phẩm
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
          Hệ thống gặp gián đoạn tạm thời khi kết nối cơ sở dữ liệu. Vui lòng thử lại sau giây lát.
        </p>
        <div className="state-actions">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary"
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-btn)",
              border: "none",
              background: "var(--primary)",
              color: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Thử lại ngay
          </button>
        </div>
      </div>
    </div>
  );
}
