// Bootstrap server-only mock
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as any;
} catch {}

(process.env as Record<string, string | undefined>).NODE_ENV = "test";

import assert from "node:assert/strict";
import { PrismaClient, Role } from "@prisma/client";
import {
  getAdminSignedUrlAction,
  GetAdminSignedUrlInput,
} from "../src/app/actions/storage";
import {
  STORAGE_BUCKETS,
  setCustomStorageClient,
  clampSignedUrlExpiry,
  MAX_SIGNED_URL_EXPIRY_SECONDS,
  DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
} from "../src/lib/storage";

const prisma = new PrismaClient();

console.log("================================================================================");
console.log("🛡️ BẮT ĐẦU CHẠY BỘ TEST: KHO RIÊNG TƯ & TẠO URL KÝ (SIGNED URL ZERO-TRUST)");
console.log("================================================================================");

let passedCount = 0;

async function runTestCase(id: string, name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${id}: ${name}`);
    passedCount++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${id}: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// Thiết lập Mock Storage Client cho môi trường kiểm thử
function setupMockStorageClient() {
  const mockStorage = {
    storage: {
      from: (bucket: string) => ({
        createSignedUrl: async (path: string, expiresIn: number) => {
          // Sinh URL ký giả lập chuẩn cấu trúc Supabase Storage
          return {
            data: {
              signedUrl: `https://bnzrwpahpmkhowhzhwbt.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_token_signature_secret&expires=${expiresIn}`,
            },
            error: null,
          };
        },
      }),
    },
  } as any;

  setCustomStorageClient(mockStorage);
}

async function main() {
  setupMockStorageClient();

  // Tìm hoặc tạo tài khoản ADMIN thực tế trong Database để thỏa mãn Foreign Key constraint
  const adminEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "Quản trị viên Hệ thống",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  // 1. TC-SURL-01: Khách vãng lai (Chưa đăng nhập) -> Bị chặn UNAUTHENTICATED
  await runTestCase("TC-SURL-01", "Chưa đăng nhập (Guest) -> Bị chặn với mã UNAUTHENTICATED", async () => {
    const emptyHeaders = new Headers();
    const result = await getAdminSignedUrlAction(
      {
        bucket: STORAGE_BUCKETS.PRIVATE_INTERNAL,
        filePath: "invoices/2026/inv-001.pdf",
      },
      emptyHeaders
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "UNAUTHENTICATED");
      assert.ok(result.message.includes("đăng nhập"));
    }
  });

  // 2. TC-SURL-02: Khách hàng (Role = USER) -> Bị chặn FORBIDDEN
  await runTestCase("TC-SURL-02", "Customer (Role = USER) -> Bị chặn với mã FORBIDDEN", async () => {
    const customerHeaders = new Headers();
    customerHeaders.set("x-test-role", Role.USER);
    customerHeaders.set("x-test-user-id", "customer-uuid-001");

    const result = await getAdminSignedUrlAction(
      {
        bucket: STORAGE_BUCKETS.PRIVATE_INTERNAL,
        filePath: "invoices/2026/inv-001.pdf",
      },
      customerHeaders
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "FORBIDDEN");
      assert.ok(result.message.includes("không có quyền") || result.message.includes("ADMIN"));
    }
  });

  // 3. TC-SURL-03: Tấn công Path Traversal -> Bị chặn INVALID_INPUT
  await runTestCase("TC-SURL-03", "Admin gửi đường dẫn Path Traversal (../) -> Bị chặn với mã INVALID_INPUT", async () => {
    const adminHeaders = new Headers();
    adminHeaders.set("x-test-role", Role.ADMIN);
    adminHeaders.set("x-test-user-id", adminUser.id);

    const maliciousPaths = [
      "../../etc/passwd",
      "invoices/../../../secret.env",
      "docs/..\\..\\passwords.txt",
      "confidential//docs.pdf",
      "test\0nullbyte.pdf",
    ];

    for (const badPath of maliciousPaths) {
      const result = await getAdminSignedUrlAction(
        {
          bucket: STORAGE_BUCKETS.PRIVATE_INTERNAL,
          filePath: badPath,
        },
        adminHeaders
      );

      assert.equal(result.ok, false, `Đường dẫn độc hại '${badPath}' phải bị từ chối!`);
      if (!result.ok) {
        assert.equal(result.code, "INVALID_INPUT");
      }
    }
  });

  // 4. TC-SURL-04: Sai bucket (Không thuộc whitelist kho nội bộ) -> Bị chặn INVALID_INPUT
  await runTestCase("TC-SURL-04", "Yêu cầu bucket không thuộc whitelist admin-internal -> Bị chặn", async () => {
    const adminHeaders = new Headers();
    adminHeaders.set("x-test-role", Role.ADMIN);
    adminHeaders.set("x-test-user-id", adminUser.id);

    const result = await getAdminSignedUrlAction(
      {
        bucket: "public-random-bucket",
        filePath: "files/doc.pdf",
      },
      adminHeaders
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "INVALID_INPUT");
    }
  });

  // 5. TC-SURL-05: Kiểm tra cơ chế ép trần thời hạn (Expiry Clamping)
  await runTestCase("TC-SURL-05", "Thời hạn URL ký được ép trần tối đa 300s và mặc định 60s", async () => {
    assert.equal(clampSignedUrlExpiry(999999), MAX_SIGNED_URL_EXPIRY_SECONDS); // Ép về 300
    assert.equal(clampSignedUrlExpiry(300), 300);
    assert.equal(clampSignedUrlExpiry(0), DEFAULT_SIGNED_URL_EXPIRY_SECONDS); // 60
    assert.equal(clampSignedUrlExpiry(-10), DEFAULT_SIGNED_URL_EXPIRY_SECONDS); // 60
    assert.equal(clampSignedUrlExpiry(undefined), DEFAULT_SIGNED_URL_EXPIRY_SECONDS); // 60
  });

  // 6. TC-SURL-06: Quản trị viên (Role = ADMIN) tạo URL ký thành công
  await runTestCase("TC-SURL-06", "Admin tạo URL ký hợp lệ -> Thành công nhận Signed URL & ExpiresAt", async () => {
    const adminHeaders = new Headers();
    adminHeaders.set("x-test-role", Role.ADMIN);
    adminHeaders.set("x-test-user-id", adminUser.id);

    const result = await getAdminSignedUrlAction(
      {
        bucket: STORAGE_BUCKETS.PRIVATE_INTERNAL,
        filePath: "finance/2026/audit_report.pdf",
        expiresInSeconds: 120,
      },
      adminHeaders
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.data.signedUrl.includes("token="));
      assert.equal(result.data.expiresInSeconds, 120);
      assert.ok(new Date(result.data.expiresAt).getTime() > Date.now());
    }
  });

  // 7. TC-SURL-07: Rà soát Audit Log -> Zero-Token Logging (Không ghi token/chữ ký vào CSDL)
  await runTestCase("TC-SURL-07", "Audit Log ghi nhận hành động nhưng TUYỆT ĐỐI KHÔNG chứa token bí mật", async () => {
    const latestLogs = await prisma.auditLog.findMany({
      where: {
        action: "GENERATE_SIGNED_URL",
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    assert.ok(latestLogs.length > 0, "Phải có ít nhất 1 bản ghi GENERATE_SIGNED_URL trong audit_logs");
    const log = latestLogs[0];
    assert.equal(log.action, "GENERATE_SIGNED_URL");
    assert.equal(log.entity, "storage");

    const rawAfter = JSON.stringify(log.after);
    // Kiểm tra không rò rỉ token bí mật
    assert.equal(rawAfter.includes("mocked_token_signature_secret"), false, "Token bí mật không được xuất hiện trong Audit Log!");
    assert.equal(rawAfter.includes("token="), false, "Query token không được xuất hiện trong Audit Log!");
  });

  console.log("\n================================================================================");
  console.log(`🎉 TẤT CẢ ${passedCount} CA KIỂM THỬ KHO RIÊNG TƯ & SIGNED URL ĐÃ VƯỢT QUA 100%!`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Lỗi khi chạy bộ test Signed URL:", err);
  process.exit(1);
});
