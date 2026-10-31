import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Danh sách tên Bucket được định nghĩa chặt chẽ (Whitelist)
 */
export const STORAGE_BUCKETS = {
  PUBLIC_PRODUCTS: "product-images",
  PRIVATE_INTERNAL: "admin-internal",
} as const;

export type AllowedBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bnzrwpahpmkhowhzhwbt.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "mock-service-key-for-local-development";

let storageClientInstance: SupabaseClient | null = null;
let customStorageClientInstance: SupabaseClient | null = null;

export function setCustomStorageClient(client: SupabaseClient | null) {
  customStorageClientInstance = client;
}

/**
 * Lấy client Supabase quản trị phía máy chủ
 */
export function getSupabaseStorageClient(): SupabaseClient {
  if (customStorageClientInstance) {
    return customStorageClientInstance;
  }
  if (!storageClientInstance) {
    storageClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return storageClientInstance;
}

/**
 * Kiểm tra và làm sạch đường dẫn lưu trữ (Chống Path Traversal)
 * Chặn triệt để: "..", "\0", ký tự lạ, dấu gạch chéo kép "//", dấu "\"
 */
export function sanitizeStoragePath(
  rawPath: string
): { ok: true; path: string } | { ok: false; message: string } {
  if (!rawPath || typeof rawPath !== "string") {
    return { ok: false, message: "Đường dẫn tệp không được để trống." };
  }

  const trimmed = rawPath.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "Đường dẫn tệp không được để trống." };
  }

  if (trimmed.includes("\0")) {
    return { ok: false, message: "Phát hiện ký tự null byte không hợp lệ." };
  }

  if (trimmed.includes("..")) {
    return {
      ok: false,
      message: "Phát hiện hành vi tấn công vượt thư mục (Path Traversal).",
    };
  }

  if (trimmed.includes("\\")) {
    return { ok: false, message: "Đường dẫn chứa ký tự dấu gạch chéo ngược không hợp lệ." };
  }

  if (trimmed.includes("//")) {
    return { ok: false, message: "Đường dẫn chứa dấu gạch chéo trùng lặp." };
  }

  // Chuẩn hóa bỏ dấu gạch đầu nếu có
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  // Chỉ cho phép chữ cái, chữ số, gạch ngang, gạch dưới, chấm và dấu gạch chéo
  const safeRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
  if (!safeRegex.test(cleanPath)) {
    return {
      ok: false,
      message: "Đường dẫn tệp chứa ký tự không an toàn hoặc không được hỗ trợ.",
    };
  }

  return { ok: true, path: cleanPath };
}

/**
 * Giới hạn thời gian sống của URL ký (Signed URL)
 * Mặc định: 60 giây.
 * Trần tối đa: 300 giây (5 phút).
 */
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 60;
export const MAX_SIGNED_URL_EXPIRY_SECONDS = 300;

export function clampSignedUrlExpiry(requestedSeconds?: number): number {
  if (!requestedSeconds || isNaN(requestedSeconds) || requestedSeconds <= 0) {
    return DEFAULT_SIGNED_URL_EXPIRY_SECONDS;
  }
  return Math.min(Math.floor(requestedSeconds), MAX_SIGNED_URL_EXPIRY_SECONDS);
}
