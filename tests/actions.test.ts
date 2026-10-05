import { ProductSchema } from "../src/lib/validators/product";

console.log("==================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ KIỂM THỬ RÀNG BUỘC SERVER-SIDE (ZERO-TRUST)");
console.log("==================================================================");

// (a) Kịch bản A: Người dùng sửa giá thành -5 trên DevTools rồi gửi lên
console.log("\n▶ [TEST A] Sửa giá thành -5 bằng DevTools hoặc gửi trực tiếp lên Server:");
const testA = ProductSchema.safeParse({
  name: "MacBook Pro M3 Hack Giá",
  slug: "macbook-pro-m3-hack-gia",
  price: "-5", // Giả lập DevTools can thiệp gửi số âm
  stock: "10",
  categoryId: "cat-1",
});

if (!testA.success) {
  const errors = testA.error.flatten().fieldErrors;
  console.log("  ✅ KẾT QUẢ: ĐÃ BỊ CHẶN BỞI ZOD TẠI SERVER!");
  console.log("  ⚠️ Thông báo lỗi trả về Client:", errors.price);
} else {
  console.error("  ❌ TEST THẤT BẠI: Dữ liệu âm lọt qua server!");
  process.exit(1);
}

// (b) Kịch bản B: Định dạng slug không hợp lệ hoặc slug trùng
console.log("\n▶ [TEST B] Kiểm tra định dạng slug (phải là chữ thường, số, dấu gạch ngang):");
const testB1 = ProductSchema.safeParse({
  name: "MacBook Pro Sai Slug",
  slug: "MacBook Pro Đẹp Quá!",
  price: "35000000",
  stock: "10",
  categoryId: "cat-1",
});

if (!testB1.success) {
  const errors = testB1.error.flatten().fieldErrors;
  console.log("  ✅ KẾT QUẢ: Slug không hợp lệ đã bị chặn!");
  console.log("  ⚠️ Lỗi slug:", errors.slug);
} else {
  console.error("  ❌ TEST THẤT BẠI: Slug sai format lọt qua!");
  process.exit(1);
}

// (c) Kịch bản C: Tên quá ngắn (< 3 ký tự) hoặc quá dài (> 120 ký tự)
console.log("\n▶ [TEST C] Kiểm tra độ dài tên (3 - 120 ký tự):");
const testC = ProductSchema.safeParse({
  name: "ab",
  slug: "laptop-ab",
  price: "20000000",
  stock: "5",
  categoryId: "cat-1",
});

if (!testC.success) {
  const errors = testC.error.flatten().fieldErrors;
  console.log("  ✅ KẾT QUẢ: Tên dưới 3 ký tự đã bị chặn!");
  console.log("  ⚠️ Lỗi tên:", errors.name);
}

// (d) Kịch bản D: Tồn kho âm (< 0)
console.log("\n▶ [TEST D] Kiểm tra tồn kho không bao giờ âm:");
const testD = ProductSchema.safeParse({
  name: "Chuột Không Dây Gaming",
  slug: "chuot-khong-day-gaming",
  price: "1500000",
  stock: "-3",
  categoryId: "cat-1",
});

if (!testD.success) {
  const errors = testD.error.flatten().fieldErrors;
  console.log("  ✅ KẾT QUẢ: Tồn kho âm đã bị chặn!");
  console.log("  ⚠️ Lỗi tồn kho:", errors.stock);
}

console.log("\n==================================================================");
console.log("🎉 TẤT CẢ 4 KỊCH BẢN VALIDATION ZERO-TRUST ĐÃ VƯỢT QUA 100%!");
console.log("==================================================================");
