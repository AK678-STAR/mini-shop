"use server";

import "server-only";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { authorize } from "@/server/guards";
import { recordAuditLog } from "@/lib/audit-log";
import { validateImage } from "@/lib/image-validator";
import {
  STORAGE_BUCKETS,
  sanitizeStoragePath,
  clampSignedUrlExpiry,
  getSupabaseStorageClient,
} from "@/lib/storage";

export interface GetAdminSignedUrlInput {
  bucket: string;
  filePath: string;
  expiresInSeconds?: number;
}

export type StorageActionResponse<T = unknown> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "FORBIDDEN"
        | "INVALID_INPUT"
        | "BAD_TYPE"
        | "TOO_LARGE"
        | "EMPTY_FILE"
        | "STORAGE_ERROR"
        | "DATABASE_ERROR";
      message: string;
    };

/**
 * 1. SERVER ACTION: TẠO URL KÝ SỐ CHO ADMIN (getAdminSignedUrlAction)
 * - Ràng buộc: Chỉ dành cho Admin, bucket nội bộ "admin-internal".
 * - Giới hạn thời gian: Mặc định 60s, tối đa 300s.
 * - Chống Path Traversal.
 * - Zero-Token Logging: Ghi Audit Log nhưng KHÔNG lưu token/chữ ký số.
 */
export async function getAdminSignedUrlAction(
  input: GetAdminSignedUrlInput,
  overrideHeaders?: Headers
): Promise<StorageActionResponse<{ signedUrl: string; expiresAt: string; expiresInSeconds: number }>> {
  // DÒNG ĐẦU TIÊN: Kiểm tra quyền ADMIN bằng guards (Defense-in-depth)
  const auth = await authorize(Role.ADMIN, overrideHeaders);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  // 1. Kiểm tra whitelist Bucket (Chỉ cho phép kho riêng tư của Admin)
  if (input.bucket !== STORAGE_BUCKETS.PRIVATE_INTERNAL) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: `Bucket không hợp lệ. Chỉ cho phép truy cập kho riêng tư '${STORAGE_BUCKETS.PRIVATE_INTERNAL}'.`,
    };
  }

  // 2. Chống Path Traversal và kiểm tra tính hợp lệ của đường dẫn
  const pathCheck = sanitizeStoragePath(input.filePath);
  if (!pathCheck.ok) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: pathCheck.message,
    };
  }
  const cleanPath = pathCheck.path;

  // 3. Giới hạn thời hạn URL ký (Mặc định 60s, trần 300s)
  const validExpiry = clampSignedUrlExpiry(input.expiresInSeconds);

  // 4. Tạo URL ký số thông qua Supabase Storage API
  const supabase = getSupabaseStorageClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PRIVATE_INTERNAL)
    .createSignedUrl(cleanPath, validExpiry);

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      code: "STORAGE_ERROR",
      message: "Không thể tạo URL ký từ máy chủ lưu trữ. Tệp có thể không tồn tại hoặc lỗi dịch vụ.",
    };
  }

  // 5. Ghi Audit Log: TUYỆT ĐỐI KHÔNG GHI TOKEN HOẶC URL KÝ ĐẦY ĐỦ VÀO LOG
  await recordAuditLog({
    actorId: auth.user.id,
    action: "GENERATE_SIGNED_URL",
    entity: "storage",
    entityId: `${STORAGE_BUCKETS.PRIVATE_INTERNAL}/${cleanPath}`,
    after: {
      bucket: STORAGE_BUCKETS.PRIVATE_INTERNAL,
      filePath: cleanPath,
      expiresInSeconds: validExpiry,
      // Query token / Signature bị loại bỏ hoàn toàn để phòng ngừa rò rỉ credential
    },
  });

  const expiresAt = new Date(Date.now() + validExpiry * 1000).toISOString();

  return {
    ok: true,
    data: {
      signedUrl: data.signedUrl,
      expiresAt,
      expiresInSeconds: validExpiry,
    },
    message: `Tạo URL ký số thành công (hiệu lực trong ${validExpiry} giây).`,
  };
}

/**
 * 2. SERVER ACTION: TẢI ẢNH SẢN PHẨM AN TOÀN (uploadProductImageAction)
 * - Ràng buộc: Chỉ dành cho Admin.
 * - Kiểm định Magic Bytes và kích thước qua validateImage.
 * - Tên tệp ngẫu nhiên chống đoán đường dẫn / ghi đè file.
 * - Cơ chế Rollback: Tự động xóa file trên Storage nếu lưu Database thất bại (Tránh file mồ côi).
 */
export async function uploadProductImageAction(
  formData: FormData,
  overrideHeaders?: Headers
): Promise<StorageActionResponse<{ imagePath: string; publicUrl: string }>> {
  // DÒNG ĐẦU TIÊN: Kiểm tra quyền ADMIN
  const auth = await authorize(Role.ADMIN, overrideHeaders);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Không tìm thấy tệp ảnh tải lên hợp lệ trong FormData.",
    };
  }

  // Kiểm định tính hợp lệ nhị phân (Zero-trust)
  const validation = await validateImage(file);
  if (!validation.ok) {
    return {
      ok: false,
      code: validation.code,
      message: validation.message,
    };
  }

  // Tạo đường dẫn ngẫu nhiên theo cấu trúc chuẩn: products/YYYY/MM/{uuid}.{ext}
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomId = crypto.randomUUID();
  const targetPath = `products/${year}/${month}/${randomId}.${validation.extension}`;

  const supabase = getSupabaseStorageClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Tải lên Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.PUBLIC_PRODUCTS)
    .upload(targetPath, buffer, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      code: "STORAGE_ERROR",
      message: "Không thể tải tệp lên máy chủ lưu trữ Storage.",
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKETS.PUBLIC_PRODUCTS)
    .getPublicUrl(targetPath);

  const publicUrl = publicUrlData.publicUrl;

  // Nếu có truyền kèm productId để cập nhật trực tiếp vào cơ sở dữ liệu
  const rawProductId = formData.get("productId");
  const cleanProductId =
    typeof rawProductId === "string" && rawProductId.trim() !== ""
      ? rawProductId.trim()
      : null;

  if (cleanProductId) {
    try {
      await prisma.product.update({
        where: { id: cleanProductId },
        data: { image: publicUrl },
      });
      revalidatePath("/products");
      revalidatePath(`/products/${cleanProductId}`);
    } catch (dbError) {
      // ROLLBACK: Xóa file vừa tải lên khỏi Storage để ngăn chặn file mồ côi (Orphan File Prevention)
      await supabase.storage
        .from(STORAGE_BUCKETS.PUBLIC_PRODUCTS)
        .remove([targetPath]);

      return {
        ok: false,
        code: "DATABASE_ERROR",
        message: "Lưu thông tin sản phẩm vào cơ sở dữ liệu thất bại. File đã được tự động dọn dẹp khỏi Storage.",
      };
    }
  }

  // Ghi Audit Log hành vi tải ảnh
  await recordAuditLog({
    actorId: auth.user.id,
    action: "UPLOAD_PRODUCT_IMAGE",
    entity: "product_image",
    entityId: targetPath,
    after: {
      imagePath: targetPath,
      size: validation.size,
      mimeType: validation.mimeType,
      productId: cleanProductId,
    },
  });

  return {
    ok: true,
    data: {
      imagePath: targetPath,
      publicUrl,
    },
    message: "Tải ảnh sản phẩm an toàn thành công.",
  };
}
