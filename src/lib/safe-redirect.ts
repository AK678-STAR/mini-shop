/**
 * Tiện ích làm sạch URL chuyển hướng chống tấn công Open Redirect (CWE-601)
 * Chuẩn hoá hàm safeNextPath(input):
 * - Chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/` hợp lệ
 * - Từ chối //, /\, chứa ':', và các ký tự điều khiển (\0, \r, \n, v.v.)
 * - Fallback nghiêm ngặt về "/"
 */
export function safeNextPath(input: unknown, fallback: string = "/"): string {
  const safeFallback =
    typeof fallback === "string" &&
    fallback.startsWith("/") &&
    !fallback.startsWith("//") &&
    !fallback.startsWith("/\\") &&
    !fallback.includes(":") &&
    !/[\x00-\x1F\x7F]/.test(fallback)
      ? fallback.trim()
      : "/";

  if (typeof input !== "string" || !input) {
    return safeFallback;
  }

  const trimmed = input.trim();

  // 1. Từ chối ngay lập tức nếu chứa ký tự điều khiển ASCII (\0, \r, \n, \t, v.v.)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return safeFallback;
  }

  // 2. Kiểm tra điều kiện đường dẫn nội bộ an toàn:
  // - Bắt buộc bắt đầu bằng '/'
  // - Không được bắt đầu bằng '//' (tránh protocol-relative redirect đến domain ngoài)
  // - Không được bắt đầu bằng '/\' (tránh bypass parser Windows/browsers)
  // - Không chứa ':' (chặn triệt để javascript:, http:, data:, file:, v.v.)
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes(":")
  ) {
    return safeFallback;
  }

  return trimmed;
}

/**
 * Bí danh tương thích ngược cho các module hiện hữu
 */
export const getSafeRedirectUrl = safeNextPath;

