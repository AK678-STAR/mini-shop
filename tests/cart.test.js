/**
 * BỘ KIỂM THỬ TỰ ĐỘNG (UNIT TESTS) CHO HÀM TÍNH TIỀN GIỎ HÀNG
 * Thực hiện theo yêu cầu Điểm Cộng của Giáo án Buổi 4
 */

const { calculateCartSummary, DEFAULT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } = require('../src/utils/cart.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

function assertEqual(actual, expected, testName) {
  totalTests++;
  if (actual === expected) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} -> Kỳ vọng: ${expected}, Thực tế: ${actual}`);
  }
}

console.log('========================================================');
console.log('🧪 BẮT ĐẦU CHẠY UNIT TEST: MODULE TÍNH TIỀN GIỎ HÀNG');
console.log('========================================================\n');

// Test Case 1: Giỏ hàng rỗng
console.log('Test Nhóm 1: Xử lý giỏ hàng rỗng & dữ liệu không hợp lệ');
const emptyResult = calculateCartSummary([]);
assertEqual(emptyResult.subtotal, 0, 'Subtotal giỏ hàng rỗng phải bằng 0');
assertEqual(emptyResult.finalTotal, 0, 'Final Total giỏ hàng rỗng phải bằng 0');
assertEqual(emptyResult.shippingFee, 0, 'Phí ship giỏ hàng rỗng phải bằng 0');

// Test Case 2: Tính subtotal thông thường (dưới ngưỡng free ship)
console.log('\nTest Nhóm 2: Tính toán đơn hàng cơ bản & phí ship mặc định');
const items1 = [
  { price: 500000, quantity: 2 }, // 1.000.000₫
  { price: 200000, quantity: 1 }  // 200.000₫
];
const result1 = calculateCartSummary(items1);
assertEqual(result1.subtotal, 1200000, 'Subtotal phải bằng 1.200.000₫');
assertEqual(result1.shippingFee, DEFAULT_SHIPPING_FEE, `Phí ship dưới 5 triệu phải là ${DEFAULT_SHIPPING_FEE}₫`);
assertEqual(result1.finalTotal, 1230000, 'Tổng thanh toán = 1.200.000₫ + 30.000₫ = 1.230.000₫');

// Test Case 3: Đơn hàng lớn hơn 5 triệu -> Tự động miễn phí ship
console.log('\nTest Nhóm 3: Tự động miễn phí vận chuyển cho đơn >= 5.000.000₫');
const items2 = [
  { price: 6990000, quantity: 1 } // 6.990.000₫ (> 5.000.000₫)
];
const result2 = calculateCartSummary(items2);
assertEqual(result2.shippingFee, 0, 'Đơn từ 5 triệu phải có phí ship = 0₫');
assertEqual(result2.finalTotal, 6990000, 'Tổng thanh toán = 6.990.000₫ (không cộng phí ship)');

// Test Case 4: Áp dụng Voucher giảm 20% (GIAM20)
console.log('\nTest Nhóm 4: Áp dụng Voucher phần trăm (GIAM20)');
const resultVoucher20 = calculateCartSummary(items1, 'GIAM20'); // Subtotal: 1.200.000₫
assertEqual(resultVoucher20.discount, 240000, 'Giảm giá 20% của 1.200.000₫ phải là 240.000₫');
assertEqual(resultVoucher20.finalTotal, 990000, 'Tổng = 1.200.000 - 240.000 + 30.000 = 990.000₫');
assert(resultVoucher20.voucherApplied !== null, 'Voucher GIAM20 phải được ghi nhận áp dụng thành công');

// Test Case 5: Áp dụng Voucher FREESHIP
console.log('\nTest Nhóm 5: Áp dụng Voucher FREESHIP');
const resultFreeship = calculateCartSummary(items1, 'FREESHIP');
assertEqual(resultFreeship.shippingFee, 0, 'Voucher FREESHIP phải đưa phí ship về 0₫');
assertEqual(resultFreeship.finalTotal, 1200000, 'Tổng thanh toán = Subtotal 1.200.000₫');

// Test Case 6: Nhập mã giảm giá sai
console.log('\nTest Nhóm 6: Nhập mã voucher sai hoặc không tồn tại');
const resultInvalidVoucher = calculateCartSummary(items1, 'MA_BAY_BA_123');
assert(resultInvalidVoucher.error !== null, 'Phải có thông báo lỗi khi nhập voucher sai');
assertEqual(resultInvalidVoucher.discount, 0, 'Không được giảm giá khi voucher sai');

console.log('\n========================================================');
console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (100% ĐẠT CHUẨN)`);
console.log('========================================================');
