"use client";

import React, { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/order";
import { OrderStatus } from "@prisma/client";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelector({ orderId, currentStatus }: OrderStatusSelectorProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    setStatus(nextStatus);
    setFeedback(null);

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.ok) {
        setFeedback("✅ Đã cập nhật");
      } else {
        setFeedback(`❌ ${res.message || "Lỗi cập nhật"}`);
        setStatus(currentStatus); // Revert
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    PENDING: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    PAID: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    SHIPPED: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    CANCELLED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  };

  const currentTheme = statusColors[status] || statusColors.PENDING;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <select
        value={status}
        disabled={isPending}
        onChange={handleChange}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: "600",
          backgroundColor: currentTheme.bg,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.border}`,
          cursor: isPending ? "wait" : "pointer",
          outline: "none",
        }}
      >
        <option value="PENDING">Chờ xử lý (PENDING)</option>
        <option value="PAID">Đã thanh toán (PAID)</option>
        <option value="SHIPPED">Đã giao hàng (SHIPPED)</option>
        <option value="CANCELLED">Đã hủy (CANCELLED)</option>
      </select>
      {feedback && (
        <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>{feedback}</span>
      )}
    </div>
  );
}
