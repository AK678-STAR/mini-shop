import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.error("❌ Lỗi: Cần cung cấp biến môi trường ADMIN_EMAIL và ADMIN_PASSWORD trong file .env!");
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("❌ Lỗi: Mật khẩu ADMIN_PASSWORD phải có độ dài tối thiểu 8 ký tự!");
    process.exit(1);
  }

  console.log(`🔐 Đang xử lý khởi tạo/cập nhật tài khoản ADMIN: ${adminEmail}...`);

  // Băm mật khẩu an toàn theo cơ chế của Better Auth
  const hashedPassword = await hashPassword(adminPassword);

  // Upsert User với Role.ADMIN
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      name: "Quản trị viên Hệ thống",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  // Tìm Account credential tương ứng của Better Auth
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Đã cập nhật mật khẩu băm mới cho tài khoản ADMIN (${adminEmail}).`);
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });
    console.log(`✅ Đã tạo mới bản ghi Account credential bảo mật cho tài khoản ADMIN (${adminEmail}).`);
  }

  console.log(`🎉 Khởi tạo tài khoản ADMIN thành công! (Quyền: ADMIN, Mật khẩu đã băm bảo mật).`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi khởi tạo tài khoản admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
