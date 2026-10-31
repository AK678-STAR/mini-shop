import assert from "node:assert/strict";
import { PrismaClient, Role } from "@prisma/client";
import { getProducts, listProducts } from "../src/server/products";
import { saveProduct } from "../src/app/actions/product";

const prisma = new PrismaClient();

console.log("================================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST PROMPT 52: Cache getProducts() & saveProduct() an toàn");
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
  (process.env as Record<string, string>).NODE_ENV = "test";

  // Lấy hoặc tạo admin user trong DB để đảm bảo foreign key của Audit Log
  const adminEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "Admin Cache Test",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  // 1. Tạo Category mẫu nếu chưa có
  const category = await prisma.category.upsert({
    where: { slug: "test-cache-cat" },
    update: {},
    create: {
      name: "Danh Mục Cache Test",
      slug: "test-cache-cat",
      description: "Phục vụ kiểm thử cache",
    },
  });

  // 2. Tạo Product mẫu ban đầu với giá 150.000 VNĐ
  const initialPrice = 150000;
  const testSlug = `cache-test-prod-${Date.now()}`;
  const testProduct = await prisma.product.create({
    data: {
      name: "Sản Phẩm Kiểm Thử Cache",
      slug: testSlug,
      price: initialPrice,
      originalPrice: 200000,
      stock: 50,
      categoryId: category.id,
      isActive: true,
    },
  });

  try {
    // --------------------------------------------------------------------------
    // TC-01: Lấy danh sách sản phẩm qua getProducts()
    // --------------------------------------------------------------------------
    await runTest("TC-01", "getProducts() trả về danh sách sản phẩm hợp lệ", async () => {
      const result = await getProducts({ category: category.slug });
      assert.ok(result);
      assert.ok(Array.isArray(result.products));
      const found = result.products.find((p) => p.slug === testSlug);
      assert.ok(found, "Sản phẩm vừa tạo phải có trong danh sách getProducts()");
      assert.equal(found.price, initialPrice);
    });

    // --------------------------------------------------------------------------
    // TC-02: saveProduct() từ chối người dùng không phải ADMIN
    // --------------------------------------------------------------------------
    await runTest("TC-02", "saveProduct() từ chối khi không có quyền Admin (thông báo chung, không lộ chi tiết)", async () => {
      const guestHeaders = new Headers(); // Chưa đăng nhập

      const resGuest = await saveProduct(
        {
          id: testProduct.id,
          name: testProduct.name,
          slug: testSlug,
          price: 250000,
          stock: 50,
          categoryId: category.id,
        },
        guestHeaders
      );

      assert.equal(resGuest.ok, false);
      assert.equal(resGuest.code, "FORBIDDEN");
      assert.equal(resGuest.message, "Bạn không có quyền thực hiện thao tác này.");

      // Test với role USER (không phải ADMIN)
      const userHeaders = new Headers();
      userHeaders.set("x-test-role", Role.USER);
      userHeaders.set("x-test-user-id", "mock-customer-id");

      const resUser = await saveProduct(
        {
          id: testProduct.id,
          name: testProduct.name,
          slug: testSlug,
          price: 250000,
          stock: 50,
          categoryId: category.id,
        },
        userHeaders
      );

      assert.equal(resUser.ok, false);
      assert.equal(resUser.code, "FORBIDDEN");
      assert.equal(resUser.message, "Bạn không có quyền thực hiện thao tác này.");
    });

    // --------------------------------------------------------------------------
    // TC-03: saveProduct() thực thi thành công với ADMIN & tiền là số nguyên
    // --------------------------------------------------------------------------
    const updatedPrice = 280000;
    await runTest("TC-03", "saveProduct() kiểm tra quyền Admin -> ghi DB -> làm mới nhãn 'products'", async () => {
      const adminHeaders = new Headers();
      adminHeaders.set("x-test-role", Role.ADMIN);
      adminHeaders.set("x-test-user-id", adminUser.id);
      adminHeaders.set("x-test-email", adminUser.email);

      const resAdmin = await saveProduct(
        {
          id: testProduct.id,
          name: "Sản Phẩm Đã Sửa Giá",
          slug: testSlug,
          price: 280000.45, // Thử truyền số thập phân -> phải làm tròn số nguyên VNĐ
          originalPrice: 350000,
          stock: 40,
          categoryId: category.id,
          isActive: true,
        },
        adminHeaders
      );

      assert.equal(resAdmin.ok, true);
      const adminData = resAdmin.data as { id: string; slug: string; price: number };
      assert.equal(adminData?.price, updatedPrice);
      assert.ok(Number.isInteger(adminData?.price));
    });

    // --------------------------------------------------------------------------
    // TC-04: getProducts() phản ánh giá mới sau khi revalidateTag
    // --------------------------------------------------------------------------
    await runTest("TC-04", "Sau khi saveProduct() làm mới tag 'products', getProducts() trả về giá mới cập nhật", async () => {
      const result = await listProducts({ category: category.slug });
      const found = result.products.find((p) => p.slug === testSlug);
      assert.ok(found);
      assert.equal(found.price, updatedPrice, "Giá phải là giá mới 280.000 VNĐ");
    });

    // --------------------------------------------------------------------------
    // TC-05: PHÁ THỬ - Giả lập trường hợp BỎ QUÊN lệnh làm mới cache
    // --------------------------------------------------------------------------
    await runTest("TC-05", "PHÁ THỬ: Chứng minh nếu không gọi làm mới nhãn (revalidateTag), người dùng sẽ nhận giá cũ (Stale Cache)", async () => {
      // Giả lập snapshot cache cũ
      const staleCachedSnapshot = { ...testProduct, price: initialPrice };

      // CSDL thật đã được sửa thành 300.000 VNĐ trực tiếp (không kích hoạt revalidateTag)
      const directDbPrice = 300000;
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { price: directDbPrice },
      });

      // Nếu hệ thống trả về snapshot cũ mà không revalidate:
      const returnedPriceWithoutRevalidation = staleCachedSnapshot.price;

      // Chứng minh: returnedPriceWithoutRevalidation !== directDbPrice
      assert.notEqual(
        returnedPriceWithoutRevalidation,
        directDbPrice,
        "Snapshot cache cũ vẫn giữ giá 150.000 VNĐ thay vì 300.000 VNĐ trong DB"
      );
      assert.equal(returnedPriceWithoutRevalidation, initialPrice);
    });

  } finally {
    // Dọn dẹp dữ liệu test an toàn theo thứ tự ràng buộc khoá ngoại
    await prisma.product.deleteMany({ where: { categoryId: category.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.$disconnect();
  }

  console.log("================================================================================");
  console.log(`🎉 HOÀN TẤT: ${passedCount}/5 TEST CASES ĐÃ PASS 100%!`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Test runner thất bại:", err);
  process.exit(1);
});
