import type { NextConfig } from "next";

/**
 * Cấu hình Security Headers toàn diện cho Mini Shop
 * 
 * PHÂN TÍCH RỦI RO & QUYẾT ĐỊNH THIẾT KẾ:
 * 1. X-Content-Type-Options: "nosniff" -> Chặn trình duyệt tự ý đoán định dạng (MIME sniffing attack).
 * 2. X-Frame-Options: "DENY" -> Chặn triệt để mọi hành vi nhúng web vào <iframe> (Chống Clickjacking / UI Redressing).
 * 3. Referrer-Policy: "strict-origin-when-cross-origin" -> Không làm rò rỉ đường dẫn đầy đủ hay query parameters khi người dùng click link ra ngoài.
 * 4. Permissions-Policy: Vô hiệu hóa quyền truy cập phần cứng nhạy cảm (camera, micro, vị trí địa lý).
 * 5. Content-Security-Policy (CSP) ở chế độ Report-Only:
 *    - RỦI RO LÀM VỠ GIAO DIỆN: Nếu bật chế độ chặn (Enforce), toàn bộ phông chữ Google Fonts (fonts.googleapis.com),
 *      ảnh Unsplash (images.unsplash.com), và inline styles phục vụ CSS transitions/animations sẽ bị trình duyệt chặn ngay lập tức.
 *    - GIẢI PHÁP AN TOÀN: Triển khai trước ở chế độ "Content-Security-Policy-Report-Only" để kiểm chứng nguồn tài nguyên,
 *      đảm bảo giao diện người dùng hoạt động hoàn hảo 100% trước khi chuyển sang chế độ chặn nghiêm ngặt.
 */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https://images.unsplash.com https: blob:",
      "connect-src 'self' http://localhost:3000 https://*.neon.tech",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
