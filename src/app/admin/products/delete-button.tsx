"use client";

import React, { useState, useTransition } from "react";
import { deleteProduct } from "@/app/actions/product";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`Bạn có chắc chắn muốn xoá sản phẩm "${productName}"?`)) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (!res.ok) {
        setErrorMessage(res.message || "Không thể xoá sản phẩm này.");
        alert(res.message || "Không thể xoá sản phẩm này.");
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #fecaca",
          background: isPending ? "#f3f4f6" : "#fef2f2",
          color: isPending ? "#9ca3af" : "#ef4444",
          fontSize: "0.85rem",
          fontWeight: "600",
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Đang xoá..." : "Xoá"}
      </button>
      {errorMessage && (
        <p style={{ color: "#b91c1c", fontSize: "0.75rem", marginTop: "4px", maxWidth: "200px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
