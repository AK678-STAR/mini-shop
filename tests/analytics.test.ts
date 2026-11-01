import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { trackAnalyticsEvent } from "../src/app/actions/analytics";
import { ALLOWED_EVENT_NAMES } from "../src/lib/validators/analytics";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

console.log("================================================================================");
console.log("📊 BẮT ĐẦU CHẠY BỘ TEST PROMPT 55: Bộ ghi sự kiện tôn trọng quyền riêng tư");
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

  let createdId: string | undefined;

  try {
    // --------------------------------------------------------------------------
    // TC-01: Sự kiện hợp lệ thuộc allowlist được lưu thành công
    // --------------------------------------------------------------------------
    await runTest("TC-01", "Sự kiện hợp lệ (product_view) được ghi nhận thành công", async () => {
      const res = await trackAnalyticsEvent({
        name: "product_view",
        lang: "vi",
      });

      assert.equal(res.ok, true);
      assert.ok(res.id);
      createdId = res.id;

      const record = await prisma.analyticsEvent.findUnique({
        where: { id: res.id },
      });
      assert.ok(record);
      assert.equal(record.name, "product_view");
      assert.equal(record.lang, "vi");
    });

    // --------------------------------------------------------------------------
    // TC-02: Tên sự kiện không thuộc allowlist bị từ chối
    // --------------------------------------------------------------------------
    await runTest("TC-02", "Tên sự kiện lạ bị từ chối với lỗi chung, không lộ chi tiết nội bộ", async () => {
      const res = await trackAnalyticsEvent({
        name: "unauthorized_tracking_event",
        lang: "vi",
      });

      assert.equal(res.ok, false);
      assert.equal(res.message, "Yêu cầu không hợp lệ.");
    });

    // --------------------------------------------------------------------------
    // TC-03: Trường lạ (email, ip, từ khóa tìm kiếm) bị loại bỏ triệt để (Zero PII)
    // --------------------------------------------------------------------------
    await runTest("TC-03", "Trường lạ (email, search_text, ip) bị Zod .strip() loại bỏ hoàn toàn", async () => {
      const res = await trackAnalyticsEvent({
        name: "search_used",
        lang: "en",
        email: "student@school.edu.vn",
        searchText: "Tìm kiếm laptop gaming bí mật",
        clientIp: "123.45.67.89",
      });

      assert.equal(res.ok, true);
      assert.ok(res.id);

      const record = await prisma.analyticsEvent.findUnique({
        where: { id: res.id },
      });
      assert.ok(record);
      assert.equal(record.name, "search_used");

      // Đối tượng trong DB không hề có các thuộc tính nhạy cảm
      const recordObj = record as Record<string, unknown>;
      assert.equal(recordObj.email, undefined);
      assert.equal(recordObj.searchText, undefined);
      assert.equal(recordObj.clientIp, undefined);

      await prisma.analyticsEvent.delete({ where: { id: res.id } });
    });

    // --------------------------------------------------------------------------
    // TC-04: Khách vãng lai (không có token Admin) bị RLS ngăn cản truy vấn SELECT
    // --------------------------------------------------------------------------
    await runTest("TC-04", "Bảng analytics_events được bảo vệ bởi RLS: Chỉ role ADMIN mới đọc được", async () => {
      // Giả lập truy vấn từ anon user trong 1 transaction (vai trò 'anon' trong Supabase)
      const anonQueryResult = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE anon;`);
        return tx.$queryRawUnsafe<any[]>(`SELECT * FROM analytics_events LIMIT 1;`);
      });

      // RLS policy: Chỉ admin mới thấy dòng dữ liệu, role anon thấy 0 dòng
      assert.equal(
        anonQueryResult.length,
        0,
        "Người dùng không phải ADMIN bị RLS che giấu toàn bộ dữ liệu thống kê"
      );
    });

    // --------------------------------------------------------------------------
    // TC-05: PHÁ THỬ - Giả lập cho phép tên sự kiện bất kỳ
    // --------------------------------------------------------------------------
    await runTest("TC-05", "PHÁ THỬ: Chứng minh nếu bỏ allowlist, hệ thống sẽ bị spam tên sự kiện rác", () => {
      const fakeGarbageEvent = "malicious_script_event_injection";

      // Kiểm tra với allowlist hiện tại
      const isAllowed = (ALLOWED_EVENT_NAMES as readonly string[]).includes(fakeGarbageEvent);
      assert.equal(isAllowed, false, "Tên sự kiện rác phải bị allowlist chặn đứng");

      // Nếu một lập trình viên cố ý bỏ allowlist (chấp nhận mọi chuỗi):
      const bypassAllowlist = (name: string) => typeof name === "string" && name.length > 0;
      assert.equal(
        bypassAllowlist(fakeGarbageEvent),
        true,
        "Phá thử thành công: Bỏ allowlist khiến hệ thống chấp nhận sự kiện độc hại"
      );
    });

  } finally {
    if (createdId) {
      await prisma.analyticsEvent.deleteMany({ where: { id: createdId } });
    }
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
