import React from "react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container" style={{ maxWidth: "600px", margin: "60px auto", padding: "0 20px" }}>
      <div className="state-card">
        <div className="state-icon">📦</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>
          Không tìm thấy sản phẩm
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px" }}>
          Sản phẩm bạn đang tìm kiếm có thể đã bị ngừng kinh doanh hoặc đường dẫn (slug) không chính xác.
        </p>
        <div className="state-actions">
          <Link
            href="/products"
            className="btn-primary"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: "var(--radius-btn)",
              background: "var(--primary)",
              color: "#ffffff",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Khám phá sản phẩm khác
          </Link>
        </div>
      </div>
    </div>
  );
}
