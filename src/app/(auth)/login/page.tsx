import React from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập — Mini Shop",
  description: "Đăng nhập tài khoản Mini Shop để đặt hàng và quản lý tài khoản.",
};

interface LoginPageProps {
  searchParams?: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const next = searchParams?.next;

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "36px 32px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "2rem" }}>🔐</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "12px" }}>
            Đăng nhập hệ thống
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "6px" }}>
            Truy cập Mini Shop với tài khoản của bạn
          </p>
        </div>

        <LoginForm initialNext={next} />
      </div>
    </div>
  );
}
