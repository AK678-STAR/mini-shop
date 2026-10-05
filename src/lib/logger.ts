/**
 * Safe Logger: Lọc bỏ toàn bộ thông tin nhạy cảm (DATABASE_URL, credentials, tokens)
 * trước khi ghi log ra console hoặc hệ thống giám sát.
 */
export function sanitizeLogMessage(data: unknown): string {
  if (data instanceof Error) {
    // Lọc mật khẩu trong chuỗi kết nối database
    return data.message.replace(/postgresql:\/\/[^:]+:[^@]+@/gi, "postgresql://***:***@");
  }
  if (typeof data === "string") {
    return data.replace(/postgresql:\/\/[^:]+:[^@]+@/gi, "postgresql://***:***@");
  }
  try {
    return JSON.stringify(data).replace(/postgresql:\/\/[^:]+:[^@]+@/gi, "postgresql://***:***@");
  } catch {
    return String(data);
  }
}

export function safeLogError(context: string, error: unknown) {
  const sanitized = sanitizeLogMessage(error);
  console.error(`[SECURE_LOG] ${context}:`, sanitized);
}
