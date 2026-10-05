"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export function NavbarAuth() {
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/products";
    } catch {
      window.location.href = "/login";
    }
  };

  if (isPending) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "#94a3b8" }}>
        <span>Đang tải...</span>
      </div>
    );
  }

  if (session && session.user) {
    const isAdmin = session.user.role === "ADMIN";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Liên kết Đơn hàng của tôi cho mọi user đã đăng nhập */}
        <Link
          href="/account/orders"
          id="link-nav-my-orders"
          style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#334155",
            textDecoration: "none",
            padding: "6px 10px",
            borderRadius: "6px",
          }}
        >
          📦 Đơn hàng
        </Link>

        {/* Liên kết quản trị chỉ hiện khi người dùng có quyền ADMIN */}
        {isAdmin && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link
              href="/admin/products"
              id="link-nav-admin-products"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontSize: "0.8rem",
                fontWeight: "700",
                textDecoration: "none",
                border: "1px solid #fde68a",
              }}
            >
              SP Admin
            </Link>
            <Link
              href="/admin/orders"
              id="link-nav-admin-orders"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "#e0e7ff",
                color: "#3730a3",
                fontSize: "0.8rem",
                fontWeight: "700",
                textDecoration: "none",
                border: "1px solid #c7d2fe",
              }}
            >
              Đơn Admin
            </Link>
          </div>
        )}

        {/* Thông tin người dùng */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: isAdmin ? "#4f46e5" : "#0284c7",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "0.875rem",
            }}
          >
            {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
              {session.user.name || session.user.email}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: "700",
                color: isAdmin ? "#dc2626" : "#64748b",
              }}
            >
              {isAdmin ? "ADMINISTRATOR" : "THÀNH VIÊN"}
            </span>
          </div>
        </div>

        {/* Nút Đăng xuất */}
        <button
          onClick={handleLogout}
          id="btn-nav-logout"
          title="Đăng xuất khỏi hệ thống"
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#475569",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // Trạng thái chưa đăng nhập
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Link
        href="/login"
        id="link-nav-login"
        style={{
          padding: "7px 14px",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "#334155",
          textDecoration: "none",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          transition: "all 0.15s ease",
        }}
      >
        Đăng nhập
      </Link>
      <Link
        href="/register"
        id="link-nav-register"
        style={{
          padding: "7px 14px",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "#ffffff",
          backgroundColor: "var(--primary, #4f46e5)",
          textDecoration: "none",
          boxShadow: "0 1px 3px rgba(79, 70, 229, 0.2)",
          transition: "all 0.15s ease",
        }}
      >
        Đăng ký
      </Link>
    </div>
  );
}
