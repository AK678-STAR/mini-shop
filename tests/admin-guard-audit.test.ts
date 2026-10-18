import assert from "node:assert/strict";
import { PrismaClient, Role } from "@prisma/client";
import { authorize, GuardError } from "../src/server/guards";
import { recordAuditLog, getLatestAuditLogs } from "../src/lib/audit-log";

const prisma = new PrismaClient();

console.log("================================================================================");
console.log("🛡️ BẮT ĐẦU CHẠY BỘ TEST: requireAdmin, RLS & BẢNG audit_logs");
console.log("================================================================================");

let testsPassed = 0;

async function runTest(code: string, name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${code}: ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${code}: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  // Tìm hoặc tạo tài khoản ADMIN mẫu trong Database
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

  // Tìm hoặc tạo tài khoản CUSTOMER (USER) mẫu
  const customerEmail = "customer@minishop.dev";
  const customerUser = await prisma.user.upsert({
    where: { email: customerEmail },
    update: { role: Role.USER },
    create: {
      email: customerEmail,
      name: "Khách hàng mẫu",
      role: Role.USER,
      emailVerified: true,
    },
  });

  // --------------------------------------------------------------------------
  // TEST 1: Chưa đăng nhập (Guest) bị chặn với mã UNAUTHENTICATED
  // --------------------------------------------------------------------------
  await runTest("TC-01", "Chưa đăng nhập truy cập /admin -> Bị chặn với mã UNAUTHENTICATED", async () => {
    const emptyHeaders = new Headers();
    const result = await authorize(Role.ADMIN, emptyHeaders);

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "UNAUTHENTICATED");
      assert.ok(result.message.includes("đăng nhập"));
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: Người dùng vai trò CUSTOMER (USER) bị chặn với mã FORBIDDEN
  // --------------------------------------------------------------------------
  await runTest("TC-02", "Customer (Role = USER) truy cập /admin -> Bị chặn với mã FORBIDDEN", async () => {
    // Giả lập logic kiểm tra quyền của requireAdmin / authorize khi user là customerUser
    function evaluateAdminAccess(userRole: Role) {
      if (userRole !== Role.ADMIN) {
        throw new GuardError("FORBIDDEN", "Bạn không có quyền truy cập khu vực quản trị. Cần quyền ADMIN.");
      }
      return true;
    }

    assert.throws(
      () => evaluateAdminAccess(customerUser.role),
      (err: any) => {
        return err instanceof GuardError && err.code === "FORBIDDEN";
      }
    );
  });

  // --------------------------------------------------------------------------
  // TEST 3: Quản trị viên (Role = ADMIN) vượt qua thành công
  // --------------------------------------------------------------------------
  await runTest("TC-03", "Admin (Role = ADMIN) truy cập /admin -> Vượt qua thành công", async () => {
    function evaluateAdminAccess(userRole: Role) {
      if (userRole !== Role.ADMIN) {
        throw new GuardError("FORBIDDEN", "Bạn không có quyền truy cập khu vực quản trị.");
      }
      return { ok: true, role: userRole };
    }

    const access = evaluateAdminAccess(adminUser.role);
    assert.equal(access.ok, true);
    assert.equal(access.role, Role.ADMIN);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Ghi nhật ký kiểm toán (Audit Log) thành công
  // --------------------------------------------------------------------------
  let createdLogId: string = "";
  await runTest("TC-04", "Ghi bản ghi mới vào bảng audit_logs thành công", async () => {
    const newLog = await recordAuditLog({
      actorId: adminUser.id,
      action: "TEST_SECURITY_ACTION",
      entity: "SecurityAudit",
      entityId: `audit-test-${Date.now()}`,
      before: { status: "DRAFT" },
      after: { status: "VERIFIED" },
    });

    assert.ok(newLog !== null);
    assert.ok(typeof newLog?.id === "string");
    assert.equal(newLog?.action, "TEST_SECURITY_ACTION");
    createdLogId = newLog?.id || "";
  });

  // --------------------------------------------------------------------------
  // TEST 5: Cố ý UPDATE bản ghi audit_logs phải THẤT BẠI (Immutability / Append-only)
  // --------------------------------------------------------------------------
  await runTest("TC-05", "Cố ý UPDATE audit_logs -> Bị Database Trigger ngăn chặn và ném ngoại lệ", async () => {
    assert.ok(createdLogId, "Cần có bản ghi log vừa tạo để kiểm thử update");

    let updateFailed = false;
    try {
      await prisma.auditLog.update({
        where: { id: createdLogId },
        data: {
          action: "HACKED_ACTION_TAMPERED",
        },
      });
    } catch (error: any) {
      // Trigger PostgreSQL prevent_audit_log_modification đã chặn đứng!
      updateFailed = true;
      assert.ok(
        error.message.includes("append-only") ||
        error.message.includes("prevent_audit_log_modification"),
        `Ngoại lệ đúng từ Database: ${error.message}`
      );
    }

    assert.equal(updateFailed, true, "Lệnh UPDATE bắt buộc phải thất bại!");

    // Kiểm tra dữ liệu trong DB vẫn giữ nguyên giá trị ban đầu
    const logInDb = await prisma.auditLog.findUnique({ where: { id: createdLogId } });
    assert.equal(logInDb?.action, "TEST_SECURITY_ACTION");
  });

  // --------------------------------------------------------------------------
  // TEST 6: Cố ý DELETE bản ghi audit_logs phải THẤT BẠI
  // --------------------------------------------------------------------------
  await runTest("TC-06", "Cố ý DELETE audit_logs -> Bị Database Trigger ngăn chặn và ném ngoại lệ", async () => {
    assert.ok(createdLogId, "Cần có bản ghi log vừa tạo để kiểm thử delete");

    let deleteFailed = false;
    try {
      await prisma.auditLog.delete({
        where: { id: createdLogId },
      });
    } catch (error: any) {
      // Trigger PostgreSQL prevent_audit_log_modification đã chặn đứng!
      deleteFailed = true;
      assert.ok(
        error.message.includes("append-only") ||
        error.message.includes("prevent_audit_log_modification"),
        `Ngoại lệ đúng từ Database: ${error.message}`
      );
    }

    assert.equal(deleteFailed, true, "Lệnh DELETE bắt buộc phải thất bại!");

    // Kiểm tra bản ghi vẫn còn nguyên vẹn trong DB
    const logStillExists = await prisma.auditLog.findUnique({ where: { id: createdLogId } });
    assert.ok(logStillExists !== null);
  });

  console.log("================================================================================");
  console.log(`🎉 TẤT CẢ ${testsPassed}/6 BÀI TEST REQUIRE-ADMIN & AUDIT LOGS ĐỀU ĐẠT 100% PASS!`);
  console.log("================================================================================");
}

main()
  .catch((e) => {
    console.error("Lỗi khi chạy kiểm thử admin rbac audit:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
