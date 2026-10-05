import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("========================================================");
  console.log("📊 KIỂM TRA DỮ LIỆU TOÀN DIỆN CƠ SỞ DỮ LIỆU MINI SHOP");
  console.log("========================================================");

  try {
    const [
      userCount,
      sessionCount,
      accountCount,
      verificationCount,
      categoryCount,
      productCount,
      orderCount,
      orderItemCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.account.count(),
      prisma.verification.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
    ]);

    console.log(`👤 Bảng User         : ${userCount} bản ghi`);
    console.log(`🔑 Bảng Session      : ${sessionCount} bản ghi`);
    console.log(`🔐 Bảng Account      : ${accountCount} bản ghi`);
    console.log(`🛡️ Bảng Verification : ${verificationCount} bản ghi`);
    console.log(`📁 Bảng Category     : ${categoryCount} bản ghi`);
    console.log(`📦 Bảng Product      : ${productCount} bản ghi`);
    console.log(`🧾 Bảng Order        : ${orderCount} bản ghi`);
    console.log(`📌 Bảng OrderItem    : ${orderItemCount} bản ghi`);
    console.log("--------------------------------------------------------");

    // Kiểm tra kiểu dữ liệu của cột price trong bảng Product
    try {
      const columnInfo: any[] = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Product' AND column_name = 'price';
      `;

      if (columnInfo.length > 0) {
        console.log(
          `🔍 Kiểu dữ liệu cột 'price' trong PostgreSQL: [${columnInfo[0].data_type.toUpperCase()}] (Số nguyên, Không chấp nhận Float)`
        );
      }
    } catch {
      // Trường hợp engine kiểm tra tại runtime
    }

    const sampleProduct = await prisma.product.findFirst({
      select: { name: true, price: true, slug: true, stock: true },
    });

    if (sampleProduct) {
      console.log(
        `💎 Mẫu sản phẩm: "${sampleProduct.name}" | Giá: ${sampleProduct.price.toLocaleString("vi-VN")}₫ | Kiểu: ${typeof sampleProduct.price} (isInteger: ${Number.isInteger(sampleProduct.price)})`
      );
    }

    console.log("========================================================");
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra cơ sở dữ liệu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
