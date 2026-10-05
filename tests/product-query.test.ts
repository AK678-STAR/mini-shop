import { parseProductQuery } from "../src/lib/validators/product-query";

console.log("==================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST PARSE QUERY: GET /api/products");
console.log("==================================================================");

let totalPassed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exit(1);
  }
}

// TEST 1: Giá trị mặc định khi thiếu toàn bộ tham số
console.log("\n▶ TEST 1: Thiếu tham số -> Tự động điền giá trị mặc định chuẩn");
const res1 = parseProductQuery({});
assert(res1.success === true, "Parse thành công khi query rỗng");
if (res1.success) {
  assert(res1.data.page === 1, "page mặc định là 1");
  assert(res1.data.pageSize === 12, "pageSize mặc định là 12");
  assert(res1.data.sort === "newest", "sort mặc định là 'newest'");
  assert(res1.data.q === undefined, "q không bắt buộc");
  assert(res1.data.category === undefined, "category không bắt buộc");
}

// TEST 2: Tham số đầy đủ hợp lệ và kiểm tra ép kiểu (coercion)
console.log("\n▶ TEST 2: Đầy đủ tham số hợp lệ (chuỗi số ép thành number chuẩn)");
const searchParams2 = new URLSearchParams({
  page: "3",
  pageSize: "24",
  q: "macbook pro",
  category: "laptop-may-tram",
  sort: "price_desc",
});
const res2 = parseProductQuery(searchParams2);
assert(res2.success === true, "Parse thành công URLSearchParams đầy đủ");
if (res2.success) {
  assert(res2.data.page === 3, "page ép kiểu thành number 3");
  assert(res2.data.pageSize === 24, "pageSize ép kiểu thành number 24");
  assert(res2.data.q === "macbook pro", "q lấy chính xác chuỗi tìm kiếm");
  assert(res2.data.category === "laptop-may-tram", "category lấy đúng danh mục");
  assert(res2.data.sort === "price_desc", "sort đúng giá trị 'price_desc'");
}

// TEST 3: Sai kiểu dữ liệu (page không phải là số)
console.log("\n▶ TEST 3: Sai kiểu dữ liệu (page = 'abc' hoặc số thập phân)");
const res3 = parseProductQuery({ page: "abc" });
assert(res3.success === false, "Bị chặn khi page không phải số hợp lệ");
if (!res3.success) {
  const errors = res3.error.flatten().fieldErrors;
  assert(Array.isArray(errors.page) && errors.page.length > 0, "Có thông báo lỗi trường page");
}

// TEST 4: Vượt giới hạn dưới (page = 0 hoặc âm)
console.log("\n▶ TEST 4: Vượt giới hạn dưới (page = 0)");
const res4 = parseProductQuery({ page: "0" });
assert(res4.success === false, "Bị chặn khi page = 0");
if (!res4.success) {
  const errors = res4.error.flatten().fieldErrors;
  assert(
    errors.page?.[0] === "page phải lớn hơn hoặc bằng 1",
    `Thông báo lỗi chính xác: "${errors.page?.[0]}"`
  );
}

// TEST 5: Vượt giới hạn trên (pageSize = 1000)
console.log("\n▶ TEST 5: Vượt giới hạn trên (pageSize = 1000, tối đa là 50)");
const res5 = parseProductQuery({ pageSize: "1000" });
assert(res5.success === false, "Bị chặn khi pageSize = 1000");
if (!res5.success) {
  const errors = res5.error.flatten().fieldErrors;
  assert(
    errors.pageSize?.[0] === "pageSize tối đa là 50",
    `Thông báo lỗi chính xác: "${errors.pageSize?.[0]}"`
  );
}

// TEST 6: Từ khoá q quá dài (> 100 ký tự)
console.log("\n▶ TEST 6: Từ khoá 'q' vượt quá 100 ký tự (Chống DoS)");
const longQuery = "a".repeat(105);
const res6 = parseProductQuery({ q: longQuery });
assert(res6.success === false, "Bị chặn khi q dài 105 ký tự");
if (!res6.success) {
  const errors = res6.error.flatten().fieldErrors;
  assert(
    errors.q?.[0] === "Từ khoá tìm kiếm 'q' không được vượt quá 100 ký tự",
    `Thông báo lỗi chính xác: "${errors.q?.[0]}"`
  );
}

// TEST 7: Sort sai giá trị không thuộc enum
console.log("\n▶ TEST 7: sort sai giá trị không thuộc enum (sort = 'random')");
const res7 = parseProductQuery({ sort: "random_sort" });
assert(res7.success === false, "Bị chặn khi sort không hợp lệ");

console.log("\n==================================================================");
console.log(`🎉 TẤT CẢ 7/7 TESTS CHO HÀM PARSE QUERY ĐÃ VƯỢT QUA (PASS 100%)!`);
console.log("==================================================================");
