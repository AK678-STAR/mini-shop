/**
 * Hàm thuần chuẩn hoá và đọc trạng thái lọc sản phẩm từ URL (searchParams).
 * Tuân thủ nguyên tắc:
 * - Không gọi mạng, không side-effect, không ném ngoại lệ (no throw).
 * - Mọi đầu vào không đáng tin/giá trị xấu tự động quay về mặc định an toàn.
 * - Tiền là số nguyên (đồng), không dùng số thực.
 */

export const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "popular"] as const;
export type ProductSortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_PAGE = 1;
export const MAX_PAGE = 100;
export const MAX_QUERY_LENGTH = 80;
export const MAX_CATEGORY_LENGTH = 50;
export const DEFAULT_SORT: ProductSortOption = "newest";

export type RawProductSearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams;

export interface NormalizedProductParams {
  page: number;
  q: string;
  sort: ProductSortOption;
  category: string;
  min: number | null;
  max: number | null;
}

/**
 * Lấy giá trị chuỗi đơn từ param (hỗ trợ cả string, string[] và URLSearchParams)
 */
function getSingleValue(
  params: RawProductSearchParams,
  key: string
): string | undefined {
  if (params instanceof URLSearchParams) {
    const val = params.get(key);
    return val !== null ? val : undefined;
  }

  const val = params[key];
  if (Array.isArray(val)) {
    return val.length > 0 ? val[0] : undefined;
  }
  return typeof val === "string" ? val : undefined;
}

/**
 * Parse số trang (page): Phải là số nguyên >= 1 và <= MAX_PAGE
 */
function parsePage(val: string | undefined): number {
  if (!val) return DEFAULT_PAGE;
  const num = Number(val.trim());
  if (!Number.isFinite(num) || num < 1 || num > MAX_PAGE) {
    return DEFAULT_PAGE;
  }
  return Math.floor(num);
}

/**
 * Parse từ khóa tìm kiếm (q): Trim khoảng trắng và cắt tối đa MAX_QUERY_LENGTH ký tự
 */
function parseQuery(val: string | undefined): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  return trimmed.slice(0, MAX_QUERY_LENGTH);
}

/**
 * Parse tuỳ chọn sắp xếp (sort): So khớp với Whitelist
 */
function parseSort(val: string | undefined): ProductSortOption {
  if (!val) return DEFAULT_SORT;
  const trimmed = val.trim();
  if (SORT_OPTIONS.includes(trimmed as ProductSortOption)) {
    return trimmed as ProductSortOption;
  }
  return DEFAULT_SORT;
}

/**
 * Parse danh mục (category): Trim và giới hạn độ dài
 */
function parseCategory(val: string | undefined): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  return trimmed.slice(0, MAX_CATEGORY_LENGTH);
}

/**
 * Parse số tiền (min / max): Tiền là số nguyên không âm (VNĐ)
 */
function parsePrice(val: string | undefined): number | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) {
    return null;
  }
  return Math.floor(num);
}

/**
 * Hàm thuần chính: Chuẩn hoá các tham số URL cho trang /products
 */
export function parseProductUrlParams(
  raw: RawProductSearchParams = {}
): NormalizedProductParams {
  const page = parsePage(getSingleValue(raw, "page"));
  const q = parseQuery(getSingleValue(raw, "q"));
  const sort = parseSort(getSingleValue(raw, "sort"));
  const category = parseCategory(getSingleValue(raw, "category"));

  let min = parsePrice(getSingleValue(raw, "min"));
  let max = parsePrice(getSingleValue(raw, "max"));

  // Kiểm tra mâu thuẫn khoảng giá: Nếu cả min và max đều có mà min > max -> Huỷ cả 2
  if (min !== null && max !== null && min > max) {
    min = null;
    max = null;
  }

  return {
    page,
    q,
    sort,
    category,
    min,
    max,
  };
}
