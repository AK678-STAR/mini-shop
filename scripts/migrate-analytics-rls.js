const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🔒 Bắt đầu thiết lập RLS cho bảng analytics_events...");
  await prisma.$executeRawUnsafe(`ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE analytics_events FORCE ROW LEVEL SECURITY;`);
  
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS anon_insert_analytics ON analytics_events;`);
  await prisma.$executeRawUnsafe(`CREATE POLICY anon_insert_analytics ON analytics_events FOR INSERT WITH CHECK (true);`);

  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS admin_select_analytics ON analytics_events;`);
  await prisma.$executeRawUnsafe(`
    CREATE POLICY admin_select_analytics ON analytics_events 
    FOR SELECT 
    USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'ADMIN');
  `);

  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon, authenticated;`);
  await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT ON analytics_events TO anon, authenticated;`);

  console.log("✅ Đã kích hoạt RLS thành công: Khách chỉ INSERT, Admin mới được SELECT.");
}

main()
  .catch((e) => {
    console.error("Lỗi cấu hình RLS:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
