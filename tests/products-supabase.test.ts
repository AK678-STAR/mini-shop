import assert from "node:assert/strict";
import {
  escapeIlikePattern,
  calculatePaginationRange,
  mapSortOptionToSupabaseOrder,
  buildProductSupabaseQuery,
  PRODUCT_PAGE_SIZE,
} from "../src/lib/products-supabase";
import { NormalizedProductParams } from "../src/lib/product-url-params";

console.log("==================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST: products-supabase logic (Giai đoạn 2)");
console.log("==================================================================");

let testsPassed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// -------------------------------------------------------------------------
// 1. Kiểm thử escapeIlikePattern (Phòng thủ DoS / Wildcard SQL Injection)
// -------------------------------------------------------------------------
runTest("TC-S01: escapeIlikePattern - Chuỗi rỗng", () => {
  assert.equal(escapeIlikePattern(""), "");
});

runTest("TC-S02: escapeIlikePattern - Từ khóa thông thường không đổi", () => {
  assert.equal(escapeIlikePattern("MacBook Pro"), "MacBook Pro");
});

runTest("TC-S03: escapeIlikePattern - Thoát ký tự %", () => {
  assert.equal(escapeIlikePattern("Giảm 50%"), "Giảm 50\\%");
  assert.equal(escapeIlikePattern("100% chính hãng"), "100\\% chính hãng");
});

runTest("TC-S04: escapeIlikePattern - Thoát ký tự _", () => {
  assert.equal(escapeIlikePattern("item_1"), "item\\_1");
  assert.equal(escapeIlikePattern("_product_"), "\\_product\\_");
});

runTest("TC-S05: escapeIlikePattern - Thoát ký tự gạch chéo ngược \\", () => {
  assert.equal(escapeIlikePattern("C:\\path"), "C:\\\\path");
});

runTest("TC-S06: escapeIlikePattern - Kết hợp cả %, _ và \\", () => {
  assert.equal(
    escapeIlikePattern("sale_50%\\hot_item%"),
    "sale\\_50\\%\\\\hot\\_item\\%"
  );
});

// -------------------------------------------------------------------------
// 2. Kiểm thử calculatePaginationRange (Kích thước trang 12, Index 0-based)
// -------------------------------------------------------------------------
runTest("TC-S07: calculatePaginationRange - Trang 1 kích thước 12", () => {
  const range = calculatePaginationRange(1, PRODUCT_PAGE_SIZE);
  assert.equal(range.safePage, 1);
  assert.equal(range.from, 0);
  assert.equal(range.to, 11);
  assert.equal(range.to - range.from + 1, 12);
});

runTest("TC-S08: calculatePaginationRange - Trang 2 kích thước 12", () => {
  const range = calculatePaginationRange(2, PRODUCT_PAGE_SIZE);
  assert.equal(range.safePage, 2);
  assert.equal(range.from, 12);
  assert.equal(range.to, 23);
  assert.equal(range.to - range.from + 1, 12);
});

runTest("TC-S09: calculatePaginationRange - Trang 0 hoặc âm -> Tự fallback về trang 1", () => {
  const rangeZero = calculatePaginationRange(0, 12);
  assert.equal(rangeZero.safePage, 1);
  assert.equal(rangeZero.from, 0);
  assert.equal(rangeZero.to, 11);

  const rangeNegative = calculatePaginationRange(-99, 12);
  assert.equal(rangeNegative.safePage, 1);
  assert.equal(rangeNegative.from, 0);
  assert.equal(rangeNegative.to, 11);
});

runTest("TC-S10: calculatePaginationRange - Trang 100", () => {
  const range = calculatePaginationRange(100, 12);
  assert.equal(range.safePage, 100);
  assert.equal(range.from, 1188);
  assert.equal(range.to, 1199);
});

// -------------------------------------------------------------------------
// 3. Kiểm thử mapSortOptionToSupabaseOrder (Whitelist Sort)
// -------------------------------------------------------------------------
runTest("TC-S11: mapSortOptionToSupabaseOrder - newest", () => {
  const sort = mapSortOptionToSupabaseOrder("newest");
  assert.deepEqual(sort, { column: "createdAt", ascending: false });
});

runTest("TC-S12: mapSortOptionToSupabaseOrder - price_asc", () => {
  const sort = mapSortOptionToSupabaseOrder("price_asc");
  assert.deepEqual(sort, { column: "price", ascending: true });
});

runTest("TC-S13: mapSortOptionToSupabaseOrder - price_desc", () => {
  const sort = mapSortOptionToSupabaseOrder("price_desc");
  assert.deepEqual(sort, { column: "price", ascending: false });
});

runTest("TC-S14: mapSortOptionToSupabaseOrder - popular", () => {
  const sort = mapSortOptionToSupabaseOrder("popular");
  assert.deepEqual(sort, { column: "createdAt", ascending: false });
});

// -------------------------------------------------------------------------
// 4. Kiểm thử buildProductSupabaseQuery với Mock Client
// -------------------------------------------------------------------------
runTest("TC-S15: buildProductSupabaseQuery - Tạo truy vấn đúng chuẩn bảo mật", () => {
  const callLogs: string[] = [];

  const mockQueryBuilder: any = {
    select(columns: string, options: any) {
      callLogs.push(`select:count=${options?.count}`);
      return this;
    },
    eq(column: string, val: any) {
      callLogs.push(`eq:${column}=${val}`);
      return this;
    },
    ilike(column: string, val: any) {
      callLogs.push(`ilike:${column}=${val}`);
      return this;
    },
    or(filter: string) {
      callLogs.push(`or:${filter}`);
      return this;
    },
    gte(column: string, val: any) {
      callLogs.push(`gte:${column}=${val}`);
      return this;
    },
    lte(column: string, val: any) {
      callLogs.push(`lte:${column}=${val}`);
      return this;
    },
    order(column: string, options: any) {
      callLogs.push(`order:${column}:asc=${options?.ascending}`);
      return this;
    },
    range(from: number, to: number) {
      callLogs.push(`range:${from}-${to}`);
      return this;
    },
  };

  const mockClient: any = {
    from(tableName: string) {
      callLogs.push(`from:${tableName}`);
      return mockQueryBuilder;
    },
  };

  const sampleParams: NormalizedProductParams = {
    page: 2,
    q: "MacBook_100%",
    sort: "price_asc",
    category: "laptop",
    min: 10000000,
    max: 30000000,
  };

  buildProductSupabaseQuery(mockClient, sampleParams, 12);

  // 1. Kiểm tra bảng truy vấn
  assert.ok(callLogs.includes("from:Product"));

  // 2. Kiểm tra tính đếm count exact không N+1
  assert.ok(callLogs.includes("select:count=exact"));

  // 3. Kiểm tra lọc isActive = true
  assert.ok(callLogs.includes("eq:isActive=true"));

  // 4. Kiểm tra từ khóa tìm kiếm đã được escape wildcards
  assert.ok(callLogs.includes("ilike:name=%MacBook\\_100\\%%"));

  // 5. Kiểm tra lọc danh mục
  assert.ok(callLogs.some((log) => log.startsWith("or:categoryId.eq.laptop")));

  // 6. Kiểm tra khoảng giá
  assert.ok(callLogs.includes("gte:price=10000000"));
  assert.ok(callLogs.includes("lte:price=30000000"));

  // 7. Kiểm tra sắp xếp whitelist và tie-breaker id
  assert.ok(callLogs.includes("order:price:asc=true"));
  assert.ok(callLogs.includes("order:id:asc=true"));

  // 8. Kiểm tra phân trang trang 2 (12-23)
  assert.ok(callLogs.includes("range:12-23"));
});

console.log("==================================================================");
console.log(`🎉 TẤT CẢ ${testsPassed} BÀI TEST SUPABASE QUERY ĐỀU ĐẠT CHUẨN (100% PASS)!`);
console.log("==================================================================");
