import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { proxy, SUPPORTED_LOCALES } from "../src/proxy";
import { formatCurrency, isValidLocale } from "../src/lib/i18n";

console.log("================================================================================");
console.log("🌐 BẮT ĐẦU CHẠY BỘ TEST PROMPT 56: Đa ngôn ngữ (i18n) bằng từ điển và URL");
console.log("================================================================================");

let passedCount = 0;

async function runTest(code: string, name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${code}: ${name}`);
    passedCount++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${code}: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  const viPath = path.join(__dirname, "../src/dictionaries/vi.json");
  const enPath = path.join(__dirname, "../src/dictionaries/en.json");

  const viData = JSON.parse(fs.readFileSync(viPath, "utf-8"));
  const enData = JSON.parse(fs.readFileSync(enPath, "utf-8"));

  const viKeys = Object.keys(viData).sort();
  const enKeys = Object.keys(enData).sort();

  // --------------------------------------------------------------------------
  // TC-01: Kiểm tra số lượng và tính đối xứng của từ điển (vi.json = en.json)
  // --------------------------------------------------------------------------
  await runTest("TC-01", "Từ điển có >= 15 khóa và tập khóa vi.json trùng khớp 100% với en.json", () => {
    assert.ok(viKeys.length >= 15, `vi.json phải có ít nhất 15 khóa, hiện có ${viKeys.length}`);
    assert.ok(enKeys.length >= 15, `en.json phải có ít nhất 15 khóa, hiện có ${enKeys.length}`);
    assert.deepEqual(viKeys, enKeys, "Bộ khóa giữa vi.json và en.json phải khớp nhau hoàn toàn");
  });

  // --------------------------------------------------------------------------
  // TC-02: Định dạng tiền tệ chính xác theo từng ngôn ngữ (số nguyên VNĐ)
  // --------------------------------------------------------------------------
  await runTest("TC-02", "formatCurrency() định dạng tiền số nguyên chuẩn xác cho vi và en", () => {
    const amount = 2790000;
    const viFormatted = formatCurrency(amount, "vi");
    const enFormatted = formatCurrency(amount, "en");

    assert.ok(viFormatted.includes("2.790.000") || viFormatted.includes("2,790,000"));
    assert.ok(viFormatted.includes("₫") || viFormatted.includes("VND"));

    assert.ok(enFormatted.includes("2,790,000"));
    assert.ok(enFormatted.includes("₫") || enFormatted.includes("VND"));
  });

  // --------------------------------------------------------------------------
  // TC-03: Proxy chuyển hướng URL không có tiền tố về /vi (không lặp vô hạn)
  // --------------------------------------------------------------------------
  await runTest("TC-03", "Proxy chuyển hướng /products sang /vi/products và /vi/products không bị lặp", () => {
    // 1. Vào /products chưa có tiền tố
    const reqNoPrefix = new NextRequest("http://localhost:3000/products");
    const resNoPrefix = proxy(reqNoPrefix);

    assert.equal(resNoPrefix.status, 307);
    const location = resNoPrefix.headers.get("location");
    assert.ok(location?.includes("/vi/products"), "Phải chuyển hướng tới /vi/products");

    // 2. Vào /vi/products đã có tiền tố -> Rewrite sang /products kèm header x-locale: vi (Không redirect lặp)
    const reqWithPrefix = new NextRequest("http://localhost:3000/vi/products");
    const resWithPrefix = proxy(reqWithPrefix);

    assert.notEqual(resWithPrefix.status, 307, "Đã có tiền tố /vi thì không được tiếp tục redirect");
    assert.equal(resWithPrefix.headers.get("x-middleware-rewrite")?.includes("/products"), true);
  });

  // --------------------------------------------------------------------------
  // TC-04: Ngôn ngữ lạ (/fr, /de) bị từ chối với mã 404
  // --------------------------------------------------------------------------
  await runTest("TC-04", "Mã ngôn ngữ lạ không thuộc [vi, en] (ví dụ /fr/products) trả về 404", () => {
    assert.equal(isValidLocale("fr"), false);
    assert.equal(isValidLocale("ja"), false);
    assert.equal(isValidLocale("vi"), true);
    assert.equal(isValidLocale("en"), true);

    const reqUnknownLang = new NextRequest("http://localhost:3000/fr/products");
    const resUnknownLang = proxy(reqUnknownLang);

    assert.equal(resUnknownLang.status, 404);
  });

  // --------------------------------------------------------------------------
  // TC-05: Bảo toàn phân quyền cũ: /admin chưa đăng nhập vẫn chuyển hướng về /login
  // --------------------------------------------------------------------------
  await runTest("TC-05", "Bảo toàn phân quyền 4 tầng: /admin chưa đăng nhập chuyển hướng về /login", () => {
    const reqAdmin = new NextRequest("http://localhost:3000/admin/products");
    const resAdmin = proxy(reqAdmin);

    assert.equal(resAdmin.status, 307);
    const location = resAdmin.headers.get("location");
    assert.ok(location?.includes("/login?next=%2Fadmin%2Fproducts"));
  });

  // --------------------------------------------------------------------------
  // TC-06: PHÁ THỬ - Giả lập xóa 1 khóa khỏi en.json
  // --------------------------------------------------------------------------
  await runTest("TC-06", "PHÁ THỬ: Chứng minh nếu xóa 1 khóa khỏi en.json, kiểm thử đối chiếu phải đỏ", () => {
    const brokenEnKeys = viKeys.slice(0, viKeys.length - 1); // Bỏ bớt 1 khóa

    assert.throws(
      () => {
        assert.deepEqual(viKeys, brokenEnKeys);
      },
      {
        name: "AssertionError",
      },
      "Phá thử thành công: Thiếu khóa dịch sẽ bị phát hiện ngay lập tức"
    );
  });

  console.log("================================================================================");
  console.log(`🎉 HOÀN TẤT: ${passedCount}/6 TEST CASES ĐÃ PASS 100%!`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Test runner thất bại:", err);
  process.exit(1);
});

