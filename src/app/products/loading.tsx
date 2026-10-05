import React from "react";

export default function ProductsLoading() {
  return (
    <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
      {/* Skeleton Hero */}
      <div style={{ marginBottom: "28px" }}>
        <div className="skeleton-pulse" style={{ width: "320px", height: "36px", marginBottom: "12px", borderRadius: "8px" }}></div>
        <div className="skeleton-pulse" style={{ width: "480px", height: "18px", borderRadius: "6px" }}></div>
      </div>

      {/* Skeleton Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
        <div className="skeleton-pulse" style={{ width: "90px", height: "38px", borderRadius: "999px" }}></div>
        <div className="skeleton-pulse" style={{ width: "130px", height: "38px", borderRadius: "999px" }}></div>
        <div className="skeleton-pulse" style={{ width: "140px", height: "38px", borderRadius: "999px" }}></div>
        <div className="skeleton-pulse" style={{ width: "120px", height: "38px", borderRadius: "999px" }}></div>
      </div>

      {/* Skeleton Product Grid (4 items) */}
      <div className="products-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-img skeleton-pulse"></div>
            <div className="skeleton-text skeleton-pulse" style={{ width: "40%", height: "12px", marginTop: "16px", borderRadius: "4px" }}></div>
            <div className="skeleton-text skeleton-pulse" style={{ width: "85%", height: "18px", margin: "10px 0", borderRadius: "4px" }}></div>
            <div className="skeleton-footer">
              <div className="skeleton-text skeleton-pulse" style={{ width: "45%", height: "24px", borderRadius: "4px" }}></div>
              <div className="skeleton-text skeleton-pulse" style={{ width: "36px", height: "36px", borderRadius: "12px" }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
