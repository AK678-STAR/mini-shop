"""
Bộ kiểm thử tự động bằng Python cho logic tính tiền giỏ hàng Mini Shop.
Chạy trực tiếp bằng lệnh: python tests/test_cart.py
"""

PROMO_CODES = {
    'GIAM20': {'type': 'percent', 'value': 20, 'desc': 'Giảm 20% tổng đơn hàng'},
    'GIAM10': {'type': 'percent', 'value': 10, 'desc': 'Giảm 10% tổng đơn hàng'},
    'MINI100K': {'type': 'fixed', 'value': 100000, 'desc': 'Giảm 100.000₫ cho đơn từ 1.000.000₫', 'minOrder': 1000000},
    'FREESHIP': {'type': 'shipping', 'value': 30000, 'desc': 'Miễn phí giao hàng toàn quốc'}
}

DEFAULT_SHIPPING_FEE = 30000
FREE_SHIPPING_THRESHOLD = 5000000

def calculate_cart_summary(items=None, voucher_code=None):
    if items is None:
        items = []
    
    subtotal = sum(item.get('price', 0) * item.get('quantity', 0) for item in items)
    
    if subtotal == 0:
        return {
            'subtotal': 0,
            'discount': 0,
            'shippingFee': 0,
            'finalTotal': 0,
            'voucherApplied': None,
            'error': None
        }
    
    shipping_fee = 0 if subtotal >= FREE_SHIPPING_THRESHOLD else DEFAULT_SHIPPING_FEE
    discount = 0
    voucher_applied = None
    error = None
    
    if voucher_code:
        code = str(voucher_code).strip().upper()
        promo = PROMO_CODES.get(code)
        
        if not promo:
            error = 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
        elif promo.get('minOrder') and subtotal < promo['minOrder']:
            error = f"Mã {code} chỉ áp dụng cho đơn hàng từ {promo['minOrder']:,}₫"
        else:
            voucher_applied = {'code': code, **promo}
            if promo['type'] == 'percent':
                discount = round((subtotal * promo['value']) / 100)
            elif promo['type'] == 'fixed':
                discount = min(promo['value'], subtotal)
            elif promo['type'] == 'shipping':
                shipping_fee = 0
                discount = 0
                
    final_total = max(0, subtotal - discount + shipping_fee)
    
    return {
        'subtotal': subtotal,
        'discount': discount,
        'shippingFee': shipping_fee,
        'finalTotal': final_total,
        'voucherApplied': voucher_applied,
        'error': error
    }

def run_tests():
    print("========================================================")
    print("🧪 BẮT ĐẦU CHẠY KIỂM THỬ PYTHON: CALCULATE CART TOTAL")
    print("========================================================")
    
    # Test 1: Empty cart
    res = calculate_cart_summary([])
    assert res['subtotal'] == 0 and res['finalTotal'] == 0
    print("  ✅ [PASS] Giỏ hàng rỗng: Subtotal = 0, Final Total = 0")
    
    # Test 2: Basic order
    items = [{'price': 500000, 'quantity': 2}, {'price': 200000, 'quantity': 1}]
    res = calculate_cart_summary(items)
    assert res['subtotal'] == 1200000 and res['shippingFee'] == 30000 and res['finalTotal'] == 1230000
    print("  ✅ [PASS] Đơn hàng thường: Subtotal = 1.200.000₫, Phí ship = 30.000₫")
    
    # Test 3: Free shipping for >= 5M
    res = calculate_cart_summary([{'price': 6990000, 'quantity': 1}])
    assert res['shippingFee'] == 0 and res['finalTotal'] == 6990000
    print("  ✅ [PASS] Đơn hàng >= 5 triệu: Tự động miễn phí ship = 0₫")
    
    # Test 4: Voucher GIAM20
    res = calculate_cart_summary(items, 'GIAM20')
    assert res['discount'] == 240000 and res['finalTotal'] == 990000
    print("  ✅ [PASS] Áp dụng mã GIAM20: Giảm 240.000₫, Tổng = 990.000₫")
    
    # Test 5: Voucher FREESHIP
    res = calculate_cart_summary(items, 'FREESHIP')
    assert res['shippingFee'] == 0 and res['finalTotal'] == 1200000
    print("  ✅ [PASS] Áp dụng mã FREESHIP: Phí ship = 0₫, Tổng = 1.200.000₫")
    
    print("========================================================")
    print("🎉 TẤT CẢ 5 KIỂM THỬ ĐÃ VƯỢT QUA XUẤT SẮC (100% PASS)")
    print("========================================================")

if __name__ == '__main__':
    run_tests()
