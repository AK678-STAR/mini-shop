import { z } from "zod";

/**
 * Zod Schema cho Query Parameters của GET /api/products
 * Quy định:
 * - page >= 1, mặc định 1
 * - pageSize: mặc định 12, tối đa 50, tối thiểu 1
 * - q: tối đa 100 ký tự
 * - sort: popular | price_asc | price_desc | newest (mặc định: newest)
 * - category: chuỗi slug hoặc ID danh mục
 */
export const ProductQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("page phải là số nguyên")
    .min(1, "page phải lớn hơn hoặc bằng 1")
    .default(1),
  pageSize: z.coerce
    .number()
    .int("pageSize phải là số nguyên")
    .min(1, "pageSize tối thiểu là 1")
    .max(50, "pageSize tối đa là 50")
    .default(12),
  q: z
    .string()
    .trim()
    .max(100, "Từ khoá tìm kiếm 'q' không được vượt quá 100 ký tự")
    .optional(),
  category: z.string().trim().optional(),
  sort: z
    .enum(["popular", "price_asc", "price_desc", "newest"])
    .default("newest"),
});

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;

/**
 * Hàm parse URLSearchParams thành object đã validate
 */
export function parseProductQuery(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
) {
  let raw: Record<string, unknown> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      if (value !== "") {
        raw[key] = value;
      }
    });
  } else {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        raw[key] = Array.isArray(value) ? value[0] : value;
      }
    }
  }

  return ProductQuerySchema.safeParse(raw);
}
