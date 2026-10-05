import React from "react";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản — Mini Shop",
  description: "Tạo tài khoản Mini Shop để nhận ưu đãi và mua sắm thiết bị công nghệ chính hãng.",
};

interface RegisterPageProps {
  searchParams?: Promise<{
    next?: string;
  }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const next = searchParams?.next;

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "36px auto",
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
          <span style={{ fontSize: "2rem" }}>✨</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "12px" }}>
            Tạo tài khoản mới
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "6px" }}>
            Trở thành thành viên của Mini Shop ngay hôm nay
          </p>
        </div>

        <RegisterForm initialNext={next} />
      </div>
    </div>
  );
}
