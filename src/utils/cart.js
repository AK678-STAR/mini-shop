/**
 * Module tính toán giỏ hàng & xử lý voucher khuyến mãi cho Mini Shop
 * Được viết theo dạng hàm thuần (Pure Functions) để dễ kiểm thử Unit Test.
 */

// Danh sách voucher khuyến mãi hợp lệ
const PROMO_CODES = {
  'GIAM20': { type: 'percent', value: 20, desc: 'Giảm 20% tổng đơn hàng' },
  'GIAM10': { type: 'percent', value: 10, desc: 'Giảm 10% tổng đơn hàng' },
  'MINI100K': { type: 'fixed', value: 100000, desc: 'Giảm 100.000₫ cho đơn từ 1.000.000₫', minOrder: 1000000 },
  'FREESHIP': { type: 'shipping', value: 30000, desc: 'Miễn phí giao hàng toàn quốc' }
};

const DEFAULT_SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 5000000; // Đơn từ 5.000.000₫ được miễn phí ship tự động

/**
 * Tính tổng tiền giỏ hàng chi tiết
 * @param {Array} items - Danh sách sản phẩm [{ price, quantity }]
 * @param {string|null} voucherCode - Mã giảm giá
 * @returns {Object} { subtotal, discount, shippingFee, finalTotal, voucherApplied, error }
 */
function calculateCartSummary(items = [], voucherCode = null) {
  // 1. Tính tạm tính (Subtotal)
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + (price * qty);
  }, 0);

  if (subtotal === 0) {
    return {
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      finalTotal: 0,
      voucherApplied: null,
      error: null
    };
  }

  // 2. Tính phí vận chuyển (Shipping fee)
  let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

  // 3. Xử lý Voucher giảm giá
  let discount = 0;
  let voucherApplied = null;
  let error = null;

  if (voucherCode) {
    const code = String(voucherCode).trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      error = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
    } else if (promo.minOrder && subtotal < promo.minOrder) {
      error = `Mã ${code} chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(promo.minOrder)}₫`;
    } else {
      voucherApplied = { code, ...promo };
      if (promo.type === 'percent') {
        discount = Math.round((subtotal * promo.value) / 100);
      } else if (promo.type === 'fixed') {
        discount = Math.min(promo.value, subtotal);
      } else if (promo.type === 'shipping') {
        shippingFee = 0;
        discount = 0; // Giảm vào phí ship
      }
    }
  }

  // 4. Tổng thanh toán cuối cùng (Không được âm)
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  return {
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    voucherApplied,
    error
  };
}

// Format tiền tệ VNĐ
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Export cho Node.js Test Runner hoặc Web Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateCartSummary,
    formatVND,
    PROMO_CODES,
    DEFAULT_SHIPPING_FEE,
    FREE_SHIPPING_THRESHOLD
  };
}
