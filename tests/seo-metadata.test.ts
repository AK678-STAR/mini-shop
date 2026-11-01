import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { generateMetadata, sanitizeJsonLd } from "../src/app/products/[slug]/page";

const prisma = new PrismaClient();

console.log("================================================================================");
console.log("🔍 BẮT ĐẦU CHẠY BỘ TEST PROMPT 54: SEO Metadata, Sitemap, Robots & JSON-LD");
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
  const baseUrl = "https://mini-shop-q7ejctkn4-k0978.vercel.app";
  process.env.NEXT_PUBLIC_SITE_URL = baseUrl;

  // 1. Tạo Category mẫu
  const category = await prisma.category.upsert({
    where: { slug: "test-seo-cat" },
    update: {},
    create: {
      name: "Danh Mục SEO Test",
      slug: "test-seo-cat",
      description: "Phục vụ kiểm thử SEO",
    },
  });

  // 2. Tạo 1 sản phẩm ĐANG BÁN (isActive: true)
  const activeSlug = `seo-active-prod-${Date.now()}`;
  const activeProduct = await prisma.product.create({
    data: {
      name: "Laptop SEO Đang Bán",
      slug: activeSlug,
      price: 25000000,
      stock: 10,
      categoryId: category.id,
      isActive: true,
    },
  });

  // 3. Tạo 1 sản phẩm BỊ ẨN / NGỪNG BÁN (isActive: false)
  const hiddenSlug = `seo-hidden-prod-${Date.now()}`;
  const hiddenProduct = await prisma.product.create({
    data: {
      name: "Laptop SEO Ngừng Bán",
      slug: hiddenSlug,
      price: 18000000,
      stock: 0,
      categoryId: category.id,
      isActive: false,
    },
  });

  try {
    // --------------------------------------------------------------------------
    // TC-01: robots.txt cấu hình đúng và chặn các khu vực nhạy cảm
    // --------------------------------------------------------------------------
    await runTest("TC-01", "robots() chặn /admin, /api, /cart, /account và chứa link sitemap", () => {
      const robotsConfig = robots();
      assert.ok(robotsConfig.rules);
      assert.ok(Array.isArray(robotsConfig.rules) || typeof robotsConfig.rules === "object");

      const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
      const disallows = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];

      assert.ok(disallows.includes("/admin/"), "Phải chặn /admin/");
      assert.ok(disallows.includes("/api/"), "Phải chặn /api/");
      assert.ok(disallows.includes("/cart"), "Phải chặn /cart");
      assert.ok(disallows.includes("/account/"), "Phải chặn /account/");
      assert.equal(robotsConfig.sitemap, `${baseUrl}/sitemap.xml`);
    });

    // --------------------------------------------------------------------------
    // TC-02: sitemap.xml chỉ chứa sản phẩm đang bán, KHÔNG chứa sản phẩm ẩn
    // --------------------------------------------------------------------------
    await runTest("TC-02", "sitemap() chỉ chứa sản phẩm đang bán, loại bỏ hoàn toàn sản phẩm ẩn", async () => {
      const siteEntries = await sitemap();
      assert.ok(Array.isArray(siteEntries));

      const urls = siteEntries.map((e) => e.url);

      // Phải có trang tĩnh công khai
      assert.ok(urls.includes(`${baseUrl}/`));
      assert.ok(urls.includes(`${baseUrl}/products`));

      // Phải có sản phẩm đang bán
      assert.ok(urls.includes(`${baseUrl}/products/${activeSlug}`), "Sản phẩm active phải có trong sitemap");

      // TUYỆT ĐỐI KHÔNG chứa sản phẩm ẩn
      assert.ok(!urls.includes(`${baseUrl}/products/${hiddenSlug}`), "Sản phẩm isActive=false không được nằm trong sitemap");

      // TUYỆT ĐỐI KHÔNG chứa trang quản trị
      assert.ok(!urls.some((u) => u.includes("/admin")), "Sitemap không được chứa bất kỳ URL admin nào");
    });

    // --------------------------------------------------------------------------
    // TC-03: generateMetadata() cho tiêu đề khác nhau & chặn index sản phẩm không tồn tại/ẩn
    // --------------------------------------------------------------------------
    await runTest("TC-03", "generateMetadata() sinh canonical, title riêng biệt và noindex cho sản phẩm ẩn", async () => {
      // Metadata của sản phẩm active
      const metaActive = await generateMetadata({
        params: Promise.resolve({ slug: activeSlug }),
      });
      assert.equal(metaActive.title, `${activeProduct.name} | Mini Shop`);
      assert.equal(metaActive.alternates?.canonical, `${baseUrl}/products/${activeSlug}`);

      // Metadata của sản phẩm ẩn (không tìm thấy trên catalog)
      const metaHidden = await generateMetadata({
        params: Promise.resolve({ slug: hiddenSlug }),
      });
      assert.equal(metaHidden.title, "Sản phẩm không tồn tại | Mini Shop");
      assert.deepEqual(metaHidden.robots, { index: false, follow: false });

      // Hai sản phẩm khác nhau phải có title khác nhau
      const metaFake = await generateMetadata({
        params: Promise.resolve({ slug: "non-existent-slug-xyz" }),
      });
      assert.equal(metaFake.title, "Sản phẩm không tồn tại | Mini Shop");
      assert.notEqual(metaActive.title, metaFake.title);
    });

    // --------------------------------------------------------------------------
    // TC-04: JSON-LD làm sạch an toàn chống tấn công XSS / Breakout thẻ script
    // --------------------------------------------------------------------------
    await runTest("TC-04", "sanitizeJsonLd() mã hóa ký tự < thành \\u003c chống vỡ thẻ script", () => {
      const maliciousPayload = {
        name: "MacBook </script><script>alert('XSS Attack')</script>",
        price: 35000000,
      };

      const sanitizedOutput = sanitizeJsonLd(maliciousPayload);

      // Tuyệt đối không chứa chuỗi ký tự < trực tiếp
      assert.ok(!sanitizedOutput.includes("</script>"), "Không được chứa thẻ đóng </script> trực tiếp");
      assert.ok(!sanitizedOutput.includes("<script>"), "Không được chứa thẻ mở <script> trực tiếp");
      assert.ok(sanitizedOutput.includes("\\u003c/script>"), "Ký tự < phải được escape thành \\u003c");
    });

    // --------------------------------------------------------------------------
    // TC-05: PHÁ THỬ - Giả lập trường hợp BỎ QUÊN bước làm sạch JSON-LD
    // --------------------------------------------------------------------------
    await runTest("TC-05", "PHÁ THỬ: Chứng minh nếu bỏ hàm sanitizeJsonLd, chuỗi JSON gốc sẽ làm vỡ HTML", () => {
      const xssAttack = {
        name: "Dell XPS </script><script>stealCookie()</script>",
      };

      // Chuỗi không qua hàm sanitizeJsonLd (chỉ JSON.stringify thuần túy)
      const rawUnsanitizedJson = JSON.stringify(xssAttack);

      // Kiểm tra: Chuỗi thô chắc chắn chứa </script> -> Phá vỡ thẻ HTML parser
      assert.ok(
        rawUnsanitizedJson.includes("</script>"),
        "Chuỗi thô chứa </script> chứng minh nguy cơ XSS nghiêm trọng nếu bỏ bước sanitize"
      );
    });

  } finally {
    // Dọn dẹp dữ liệu test
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

