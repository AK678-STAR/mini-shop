import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { NavbarAuth } from "@/components/navbar-auth";
import "@/style.css";

export const metadata: Metadata = {
  title: "Mini Shop — Thiết Bị & Khóa Học Công Nghệ Cao Cấp",
  description: "Cửa hàng công nghệ chuyên ngành CNTT: Laptop máy trạm, linh kiện, bản quyền phần mềm và khóa học chất lượng cao.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Main Navbar */}
        <header className="navbar">
          <div className="navbar-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link href="/products" className="brand-logo" style={{ textDecoration: "none" }}>
                <span className="brand-icon">⚡</span>
                <span className="brand-name">
                  Mini<span className="highlight">Shop</span>
                </span>
              </Link>

              {/* Navigation links */}
              <nav className="nav-links">
                <Link href="/products" className="nav-link active">
                  Cửa hàng
                </Link>
              </nav>
            </div>

            {/* Actions & Auth status */}
            <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/products" className="cart-btn" aria-label="Giỏ hàng">
                <span>🛒</span>
                <span className="cart-badge">2</span>
              </Link>
              <NavbarAuth />
            </div>
          </div>
        </header>

        {/* Main App Content */}
        <main style={{ minHeight: "calc(100vh - 160px)", padding: "24px 0" }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--border-color)", padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <p>© 2026 Mini Shop (Vibe Coding Buổi 5) • Hệ thống cơ sở dữ liệu PostgreSQL & Next.js App Router</p>
        </footer>
      </body>
    </html>
  );
}
