import { z } from "zod";

/**
 * Zod Schema cho ID Sản phẩm
 */
export const ProductIdSchema = z
  .string()
  .trim()
  .min(1, "Mã sản phẩm không được để trống");

/**
 * Zod Schema cho dữ liệu Sản phẩm (Product) - Tương thích chuẩn Zod v4+
 * Dùng chung giữa Client-side (form validation sớm) và Server-side (bắt buộc)
 */
export const ProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Tên sản phẩm phải có độ dài từ 3 đến 120 ký tự")
    .max(120, "Tên sản phẩm không được vượt quá 120 ký tự"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug không được để trống")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (-)"
    ),
  price: z.coerce
    .number()
    .int("Giá sản phẩm phải là số nguyên theo đơn vị VNĐ")
    .positive("Giá sản phẩm phải lớn hơn 0 đồng"),
  originalPrice: z.coerce
    .number()
    .int("Giá gốc phải là số nguyên theo đơn vị VNĐ")
    .positive("Giá gốc phải lớn hơn 0 đồng")
    .optional()
    .nullable(),
  stock: z.coerce
    .number()
    .int("Số lượng tồn kho phải là số nguyên")
    .nonnegative("Số lượng tồn kho không được là số âm (tối thiểu là 0)"),
  categoryId: z
    .string()
    .min(1, "Vui lòng chọn danh mục cho sản phẩm"),
  description: z.string().trim().optional().nullable(),
  image: z
    .string()
    .trim()
    .url("Đường dẫn ảnh sản phẩm không hợp lệ")
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z.coerce.boolean().optional().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export interface ActionResponse<T = unknown> {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  code?: "INVALID_INPUT" | "DUPLICATE_SLUG" | "NOT_FOUND" | "IN_USE" | "FORBIDDEN" | "UNAUTHENTICATED" | "UNKNOWN";
  data?: T;
}
