"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { safeNextPath } from "@/lib/safe-redirect";

interface LoginFormProps {
  initialNext?: string;
}

export function LoginForm({ initialNext }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: trimmedEmail,
        password: password,
      });

      if (result.error) {
        // Xử lý Rate Limit (HTTP 429: Too Many Requests)
        const isRateLimited =
          result.error.status === 429 ||
          result.error.message?.toLowerCase().includes("too many requests") ||
          result.error.message?.toLowerCase().includes("rate limit") ||
          (result.error as unknown as { statusCode?: number }).statusCode === 429;

        if (isRateLimited) {
          setErrorMessage(
            "Bạn đã thử đăng nhập sai quá nhiều lần. Vì lý do bảo mật, tài khoản tạm thời bị khóa. Vui lòng thử lại sau 15 phút."
          );
        } else {
          // Nguyên tắc bảo mật: Không tiết lộ email hay mật khẩu sai (Chống dò tài khoản / User Enumeration)
          setErrorMessage("Email hoặc mật khẩu chưa đúng.");
        }
        setIsLoading(false);
        return;
      }

      // Làm sạch URL chuyển hướng chống Open Redirect (fallback về "/")
      const safeTarget = safeNextPath(initialNext, "/");
      window.location.href = safeTarget;
    } catch (err: unknown) {
      const errorObj = err as { status?: number; statusCode?: number; message?: string };
      const isRateLimited =
        errorObj?.status === 429 ||
        errorObj?.statusCode === 429 ||
        errorObj?.message?.toLowerCase().includes("too many requests") ||
        errorObj?.message?.toLowerCase().includes("rate limit");

      if (isRateLimited) {
        setErrorMessage(
          "Bạn đã thử đăng nhập sai quá nhiều lần. Vì lý do bảo mật, tài khoản tạm thời bị khóa. Vui lòng thử lại sau 15 phút."
        );
      } else {
        setErrorMessage("Email hoặc mật khẩu chưa đúng.");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
          htmlFor="login-email"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Địa chỉ Email <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@minishop.dev hoặc email của bạn"
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
          htmlFor="login-password"
          style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}
        >
          Mật khẩu <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
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
        id="btn-login-submit"
        disabled={isLoading}
        style={{
          marginTop: "6px",
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
        {isLoading ? "Đang xác thực..." : "Đăng nhập"}
      </button>

      <div style={{ textAlign: "center", marginTop: "8px", fontSize: "0.875rem", color: "#64748b" }}>
        Chưa có tài khoản?{" "}
        <Link
          href={`/register${initialNext ? `?next=${encodeURIComponent(initialNext)}` : ""}`}
          style={{ color: "var(--primary, #4f46e5)", fontWeight: "600", textDecoration: "none" }}
        >
          Đăng ký tài khoản mới
        </Link>
      </div>
    </form>
  );
}
