"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { safeNextPath } from "@/lib/safe-redirect";

interface RegisterFormProps {
  initialNext?: string;
}

export function RegisterForm({ initialNext }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage("Vui lòng điền đầy đủ các trường thông tin bắt buộc.");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage("Họ và tên phải có tối thiểu 2 ký tự.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Mật khẩu phải có độ dài tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi Better Auth client signUp
      // role KHÔNG gửi từ client; server áp đặt mặc định USER và input: false
      const result = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password: password,
      });

      if (result.error) {
        // Thông báo lỗi tiếng Việt ngắn gọn, an toàn
        const rawMsg = result.error.message || "";
        if (rawMsg.toLowerCase().includes("already exists") || result.error.status === 422) {
          setErrorMessage("Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.");
        } else if (rawMsg.toLowerCase().includes("password")) {
          setErrorMessage("Mật khẩu chưa đáp ứng tiêu chuẩn an toàn (tối thiểu 8 ký tự).");
        } else {
          setErrorMessage("Đăng ký không thành công. Vui lòng thử lại sau.");
        }
        setIsLoading(false);
        return;
      }

      // Đăng ký thành công -> Chuyển về trang an toàn (fallback về "/")
      const safeTarget = safeNextPath(initialNext, "/");
      window.location.href = safeTarget;
    } catch {
      setErrorMessage("Hệ thống bận. Vui lòng thử lại sau giây lát.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="reg-name"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Họ và tên <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="reg-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "0.95rem",
            outline: "none",
            backgroundColor: isLoading ? "#f8fafc" : "#ffffff",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="reg-email"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Địa chỉ Email <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@domain.com"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "0.95rem",
            outline: "none",
            backgroundColor: isLoading ? "#f8fafc" : "#ffffff",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="reg-password"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Mật khẩu (tối thiểu 8 ký tự) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 8 ký tự"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "0.95rem",
            outline: "none",
            backgroundColor: isLoading ? "#f8fafc" : "#ffffff",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="reg-confirm-password"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Xác nhận lại mật khẩu <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu vừa nhập"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "0.95rem",
            outline: "none",
            backgroundColor: isLoading ? "#f8fafc" : "#ffffff",
          }}
        />
      </div>

      <button
        type="submit"
        id="btn-register-submit"
        disabled={isLoading}
        style={{
          marginTop: "8px",
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: isLoading ? "#94a3b8" : "var(--primary, #4f46e5)",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "1rem",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
          transition: "background-color 0.2s ease",
        }}
      >
        {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <div style={{ textAlign: "center", marginTop: "8px", fontSize: "0.875rem", color: "#64748b" }}>
        Đã có tài khoản?{" "}
        <Link
          href={`/login${initialNext ? `?next=${encodeURIComponent(initialNext)}` : ""}`}
          style={{ color: "var(--primary, #4f46e5)", fontWeight: "600", textDecoration: "none" }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
