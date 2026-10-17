import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicClient } from "@/lib/supabase/client";
import {
  NormalizedProductParams,
  ProductSortOption,
} from "@/lib/product-url-params";
import type { ProductDTO, ListProductsResult } from "@/server/products";

export const PRODUCT_PAGE_SIZE = 12;

/**
 * Hàm thuần: Thoát các ký tự đại diện đặc biệt (wildcards) của SQL ILIKE (\, %, _)
 * Ngăn chặn tấn công DoS Full Table Scan và sai lệch logic tìm kiếm.
 */
export function escapeIlikePattern(input: string): string {
  if (!input) return "";
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * Hàm thuần: Tính toán dải phân trang (range: from, to) cho PostgREST / Supabase
 * Range trong Supabase là inclusive [from, to] với index bắt đầu từ 0.
 */
export function calculatePaginationRange(
  page: number,
  pageSize: number = PRODUCT_PAGE_SIZE
): { from: number; to: number; safePage: number } {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to, safePage };
}

export interface SortOrderConfig {
  column: string;
  ascending: boolean;
}

/**
 * Hàm thuần: Ánh xạ tuỳ chọn sắp xếp sang cấu hình Order của Supabase.
 * Đảm bảo danh sách trắng (Whitelist) và luôn đi kèm tie-breaker (id)
 */
export function mapSortOptionToSupabaseOrder(
  sort: ProductSortOption
): SortOrderConfig {
  switch (sort) {
    case "price_asc":
      return { column: "price", ascending: true };
    case "price_desc":
      return { column: "price", ascending: false };
    case "popular":
    case "newest":
    default:
      return { column: "createdAt", ascending: false };
  }
}

/**
 * Hàm thuần: Xây dựng truy vấn PostgREST / Supabase
 * - Không N+1: Nhúng bảng Category (Category(id, name, slug)) trong 1 truy vấn.
 * - Lấy tổng số dòng (count: "exact") trong cùng truy vấn.
 * - Thoát ký tự nhạy cảm trong từ khoá tìm kiếm.
 * - Whitelist sort + tie-breaker ID.
 */
export function buildProductSupabaseQuery(
  client: SupabaseClient,
  params: NormalizedProductParams,
  pageSize: number = PRODUCT_PAGE_SIZE
) {
  const { from, to } = calculatePaginationRange(params.page, pageSize);
  const sortConfig = mapSortOptionToSupabaseOrder(params.sort);

  // 1 truy vấn duy nhất lấy cả dữ liệu sản phẩm, quan hệ danh mục và tổng số bản ghi
  let query = client
    .from("Product")
    .select(
      `
      id,
      name,
      slug,
      price,
      originalPrice,
      stock,
      image,
      createdAt,
      category:Category(id, name, slug)
    `,
      { count: "exact" }
    )
    .eq("isActive", true);

  // 1. Tìm kiếm theo tên sản phẩm có thoát ký tự % và _
  if (params.q) {
    const escaped = escapeIlikePattern(params.q);
    query = query.ilike("name", `%${escaped}%`);
  }

  // 2. Lọc theo danh mục
  if (params.category && params.category !== "all") {
    // PostgREST cho phép lọc theo quan hệ nhúng hoặc categoryId
    query = query.or(
      `categoryId.eq.${params.category},category.slug.eq.${params.category}`
    );
  }

  // 3. Lọc theo khoảng giá (VNĐ nguyên)
  if (params.min !== null) {
    query = query.gte("price", params.min);
  }
  if (params.max !== null) {
    query = query.lte("price", params.max);
  }

  // 4. Sắp xếp theo Whitelist + Tie-breaker ID để phân trang ổn định (Deterministic Pagination)
  query = query
    .order(sortConfig.column, { ascending: sortConfig.ascending })
    .order("id", { ascending: true })
    .range(from, to);

  return query;
}

/**
 * Thực thi truy vấn sản phẩm qua Supabase Client với Publishable Key.
 * Có cơ chế xử lý lỗi an toàn không làm rò rỉ cấu trúc DB nội bộ ra ngoài UI.
 */
export async function fetchProductsViaSupabase(
  params: NormalizedProductParams,
  pageSize: number = PRODUCT_PAGE_SIZE
): Promise<ListProductsResult> {
  const client = getSupabasePublicClient();

  // Nếu chưa có client (chưa cấu hình publishable key), fallback an toàn
  if (!client) {
    const { listProducts } = await import("@/server/products");
    return listProducts({
      page: params.page,
      pageSize,
      q: params.q,
      category: params.category,
      sort: params.sort,
    });
  }

  try {
    const query = buildProductSupabaseQuery(client, params, pageSize);
    const { data, count, error } = await query;

    if (error) {
      // Ghi log chi tiết phía server để debug, không ném lộ thông tin nhạy cảm
      console.error("[Supabase Query Error]", error.message);
      // Fallback an toàn về database layer
      const { listProducts } = await import("@/server/products");
      return listProducts({
        page: params.page,
        pageSize,
        q: params.q,
        category: params.category,
        sort: params.sort,
      });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    // Chuẩn hoá DTO cho UI
    const products: ProductDTO[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      stock: Number(item.stock),
      image: item.image,
      category: Array.isArray(item.category) ? item.category[0] : item.category,
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : new Date(item.createdAt).toISOString(),
    }));

    return {
      products,
      total,
      totalPages,
      page: params.page,
      pageSize,
    };
  } catch (err: any) {
    console.error("[Supabase Fetch Exception]", err?.message || err);
    const { listProducts } = await import("@/server/products");
    return listProducts({
      page: params.page,
      pageSize,
      q: params.q,
      category: params.category,
      sort: params.sort,
    });
  }
}

/**
 * Lấy danh mục để hiển thị thanh lọc trên UI
 */
export async function fetchCategoriesViaSupabase() {
  const client = getSupabasePublicClient();

  if (!client) {
    const { getCategories } = await import("@/server/products");
    return getCategories();
  }

  try {
    const { data, error } = await client
      .from("Category")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error || !data) {
      const { getCategories } = await import("@/server/products");
      return getCategories();
    }

    return data as { id: string; name: string; slug: string }[];
  } catch {
    const { getCategories } = await import("@/server/products");
    return getCategories();
  }
}
