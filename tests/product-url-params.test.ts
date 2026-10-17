import assert from "node:assert/strict";
import {
  parseProductUrlParams,
  DEFAULT_PAGE,
  DEFAULT_SORT,
  MAX_PAGE,
  MAX_QUERY_LENGTH,
} from "../src/lib/product-url-params";

console.log("==================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST: parseProductUrlParams (/products)");
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

// TC-01: Giá trị mặc định khi truyền object rỗng
runTest("TC-01: Query rỗng -> Giá trị mặc định an toàn", () => {
  const result = parseProductUrlParams({});
  assert.equal(result.page, DEFAULT_PAGE);
  assert.equal(result.q, "");
  assert.equal(result.sort, DEFAULT_SORT);
  assert.equal(result.category, "");
  assert.equal(result.min, null);
  assert.equal(result.max, null);
});

// TC-02: Tham số đầy đủ hợp lệ
runTest("TC-02: Tham số đầy đủ hợp lệ", () => {
  const result = parseProductUrlParams({
    page: "3",
    q: "MacBook Pro",
    sort: "price_desc",
    category: "laptop-may-tram",
    min: "20000000",
    max: "50000000",
  });
  assert.equal(result.page, 3);
  assert.equal(result.q, "MacBook Pro");
  assert.equal(result.sort, "price_desc");
  assert.equal(result.category, "laptop-may-tram");
  assert.equal(result.min, 20000000);
  assert.equal(result.max, 50000000);
});

// TC-03: Hỗ trợ URLSearchParams và mảng chuỗi (Next.js lặp key)
runTest("TC-03: Lặp key (mảng chuỗi) -> Lấy phần tử đầu tiên hợp lệ", () => {
  const result = parseProductUrlParams({
    q: ["ThinkPad", "MacBook"],
    page: ["2", "5"],
    sort: ["popular", "newest"],
  });
  assert.equal(result.q, "ThinkPad");
  assert.equal(result.page, 2);
  assert.equal(result.sort, "popular");
});

// TC-04: page âm hoặc bằng 0 -> fallback 1
runTest("TC-04: page âm hoặc 0 -> fallback 1", () => {
  assert.equal(parseProductUrlParams({ page: "-5" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "0" }).page, 1);
});

// TC-05: page không phải là số (chữ, NaN, chuỗi lạ) -> fallback 1
runTest("TC-05: page chữ / NaN / rác -> fallback 1", () => {
  assert.equal(parseProductUrlParams({ page: "abc" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "NaN" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "undefined" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "   " }).page, 1);
});

// TC-06: page số thực -> làm tròn xuống số nguyên (Math.floor)
runTest("TC-06: page số thực thập phân -> làm tròn số nguyên", () => {
  assert.equal(parseProductUrlParams({ page: "3.9" }).page, 3);
});

// TC-07: page vượt quá giới hạn tối đa -> fallback 1
runTest("TC-07: page vượt MAX_PAGE (100) -> fallback 1", () => {
  assert.equal(parseProductUrlParams({ page: "101" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "99999999999" }).page, 1);
  assert.equal(parseProductUrlParams({ page: "100" }).page, 100); // Biên hợp lệ
});

// TC-08: q trim khoảng trắng thừa
runTest("TC-08: q có khoảng trắng thừa -> trim sạch sẽ", () => {
  const result = parseProductUrlParams({ q: "   tai nghe bluetooth   " });
  assert.equal(result.q, "tai nghe bluetooth");
});

// TC-09: q vượt quá 80 ký tự -> cắt đúng 80 ký tự đầu tiên
runTest("TC-09: q vượt quá 80 ký tự -> cắt ngắn còn đúng 80 ký tự", () => {
  const longText = "a".repeat(120);
  const result = parseProductUrlParams({ q: longText });
  assert.equal(result.q.length, MAX_QUERY_LENGTH);
  assert.equal(result.q, "a".repeat(80));
});

// TC-10: sort không nằm trong Whitelist -> fallback newest
runTest("TC-10: sort giá trị lạ / payload injection -> fallback newest", () => {
  assert.equal(parseProductUrlParams({ sort: "random_col" }).sort, "newest");
  assert.equal(parseProductUrlParams({ sort: "drop table products" }).sort, "newest");
  assert.equal(parseProductUrlParams({ sort: "" }).sort, "newest");
});

// TC-11: min / max âm hoặc chữ -> fallback null
runTest("TC-11: min/max là số âm hoặc chữ -> fallback null", () => {
  const result = parseProductUrlParams({ min: "-1000", max: "khong_phai_so" });
  assert.equal(result.min, null);
  assert.equal(result.max, null);
});

// TC-12: min / max là số thực lẻ -> làm tròn thành số nguyên đồng
runTest("TC-12: min/max số thực -> làm tròn số nguyên (VNĐ)", () => {
  const result = parseProductUrlParams({ min: "150000.99", max: "200000.4" });
  assert.equal(result.min, 150000);
  assert.equal(result.max, 200000);
});

// TC-13: Mâu thuẫn logic: min > max -> huỷ cả hai (fallback null)
runTest("TC-13: min > max -> vô hiệu khoảng giá (min=null, max=null)", () => {
  const result = parseProductUrlParams({ min: "50000000", max: "10000000" });
  assert.equal(result.min, null);
  assert.equal(result.max, null);
});

// TC-14: min <= max hợp lệ
runTest("TC-14: min <= max hợp lệ -> giữ nguyên", () => {
  const result = parseProductUrlParams({ min: "10000000", max: "20000000" });
  assert.equal(result.min, 10000000);
  assert.equal(result.max, 20000000);
});

// TC-15: Chỉ truyền min hoặc chỉ truyền max hợp lệ
runTest("TC-15: Chỉ truyền min hoặc max đơn lẻ -> giữ nguyên giá trị đó", () => {
  const res1 = parseProductUrlParams({ min: "5000000" });
  assert.equal(res1.min, 5000000);
  assert.equal(res1.max, null);

  const res2 = parseProductUrlParams({ max: "15000000" });
  assert.equal(res2.min, null);
  assert.equal(res2.max, 15000000);
});

console.log("\n==================================================================");
console.log(`🎉 TẤT CẢ ${testsPassed}/${testsPassed} TEST CASES ĐÃ PASS 100%!`);
console.log("==================================================================");
