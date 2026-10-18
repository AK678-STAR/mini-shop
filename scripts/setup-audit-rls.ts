import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupAuditRls() {
  console.log("🔒 Đang thiết lập RLS & Trigger Append-only cho bảng audit_logs...");

  try {
    // 1. Kích hoạt Row Level Security
    await prisma.$executeRawUnsafe(`ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;`);
    console.log("  ✅ Đã kích hoạt RLS trên bảng audit_logs.");

    // 2. Tạo policy SELECT và INSERT
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "audit_logs_select_policy" ON "audit_logs";`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "audit_logs_select_policy" ON "audit_logs" FOR SELECT USING (true);`);

    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "audit_logs_insert_policy" ON "audit_logs";`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "audit_logs_insert_policy" ON "audit_logs" FOR INSERT WITH CHECK (true);`);
    console.log("  ✅ Đã cấu hình Policies: SELECT và INSERT.");

    // 3. Cấm tuyệt đối UPDATE và DELETE ở cấp độ Database Trigger (Immutability / Append-only)
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'BẢO MẬT: Bảng audit_logs là append-only, cấm tuyệt đối mọi hành vi UPDATE hoặc DELETE!';
      END;
      $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON "audit_logs";`);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_prevent_audit_log_update
      BEFORE UPDATE OR DELETE ON "audit_logs"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_audit_log_modification();
    `);
    console.log("  ✅ Đã tạo Trigger ngăn chặn vĩnh viễn UPDATE/DELETE trên audit_logs.");
    console.log("🎉 Hoàn tất cấu hình bảo mật cơ sở dữ liệu cho audit_logs!");
  } catch (error) {
    console.error("❌ Lỗi khi thiết lập RLS/Trigger:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupAuditRls();
