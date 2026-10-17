import assert from "node:assert/strict";
import { extractOrderCodeFromContent } from "../src/lib/sepay";

console.log("==================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST: SePay Webhook Parser");
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
// 1. Kiểm thử trích xuất mã đơn hàng từ nội dung chuyển khoản
// -------------------------------------------------------------------------
runTest("TC-W01: Chuỗi rỗng -> null", () => {
  assert.equal(extractOrderCodeFromContent(""), null);
});

runTest("TC-W02: Nội dung chuyển khoản chuẩn ORD-timestamp-suffix", () => {
  const content = "NGUYEN VAN A CHUYEN KHOAN ORD-1729174829102-X9AB MUA HANG";
  assert.equal(extractOrderCodeFromContent(content), "ORD-1729174829102-X9AB");
});

runTest("TC-W03: Không phân biệt hoa thường (case-insensitive)", () => {
  const content = "thanh toan ord-1729174829102-x9ab mini shop";
  assert.equal(extractOrderCodeFromContent(content), "ORD-1729174829102-X9AB");
});

runTest("TC-W04: Ngân hàng bỏ dấu gạch ngang (ORD1729174829102X9AB)", () => {
  const content = "MBBank chuyen tien ORD1729174829102X9AB nhanh 247";
  assert.equal(extractOrderCodeFromContent(content), "ORD1729174829102X9AB");
});

runTest("TC-W05: Nội dung không chứa mã đơn hàng hợp lệ -> null", () => {
  const content = "Nguyen Van B mung sinh nhat ban nhe";
  assert.equal(extractOrderCodeFromContent(content), null);
});

runTest("TC-W06: Mã đơn hàng nằm sát ký tự đặc biệt", () => {
  const content = "[ORD-1792244628100-M7K2]: Thanh toan don hang";
  assert.equal(extractOrderCodeFromContent(content), "ORD-1792244628100-M7K2");
});

console.log("==================================================================");
console.log(`🎉 TẤT CẢ ${testsPassed}/6 BÀI TEST SEPAY WEBHOOK ĐỀU ĐẠT CHUẨN (100% PASS)!`);
console.log("==================================================================");
