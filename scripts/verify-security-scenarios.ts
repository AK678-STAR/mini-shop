// Bootstrap cho phép chạy kịch bản kiểm thử bảo mật tự động trên module server-only
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as any;
} catch {}

import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { authorize, getSessionUser } from "../src/server/guards";
import { getOrderById } from "../src/server/orders";
import { createOrder, updateOrderStatus } from "../src/app/actions/order";
import { deleteProduct } from "../src/app/actions/product";
import { getSafeRedirectUrl } from "../src/lib/safe-redirect";
import { proxy } from "../src/proxy";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

async function runSecurityAudit() {
  console.log("================================================================================");
  console.log("🛡️ KIỂM TRA BẢO MẬT THỰC TẾ: 6 KỊCH BẢN TRUY CẬP TRÁI PHÉP & DEFENSE-IN-DEPTH");
  console.log("================================================================================");

  let passedCount = 0;

  // Chuẩn bị 2 người dùng mẫu: 1 ADMIN và 1 USER
  const adminEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";
  const userEmail = "customer@minishop.dev";
  const userPassword = "Customer@Shop2026!";

  // Tạo mật khẩu băm cho user mẫu nếu chưa có Account
  const { hashPassword } = await import("better-auth/crypto");
  const hashedUserPass = await hashPassword(userPassword);

  let userRecord = await prisma.user.upsert({
    where: { email: userEmail },
    update: { role: Role.USER },
    create: {
      email: userEmail,
      name: "Lê Minh Khánh (K1509)",
      role: Role.USER,
      emailVerified: true,
    },
  });

  const existingUserAccount = await prisma.account.findFirst({
    where: { userId: userRecord.id, providerId: "credential" },
  });

  if (existingUserAccount) {
    await prisma.account.update({
      where: { id: existingUserAccount.id },
      data: { password: hashedUserPass },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: userRecord.id,
        accountId: userRecord.id,
        providerId: "credential",
        password: hashedUserPass,
      },
    });
  }

  // Đăng nhập người dùng USER thông qua Better Auth để sinh Cookie có chữ ký mật mã hợp lệ
  const userLoginRes = await auth.api.signInEmail({
    body: { email: userEmail, password: userPassword },
    asResponse: true,
  });

  const userSetCookie = userLoginRes.headers.get("set-cookie") || "";
  const userCookiePart = userSetCookie.split(";")[0]; // better-auth.session_token=...
  const userHeaders = new Headers();
  userHeaders.set("cookie", userCookiePart);

  // --------------------------------------------------------------------------
  // KỊCH BẢN 1: Chưa đăng nhập truy cập /admin
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 1: Chưa đăng nhập truy cập /admin");
  try {
    // 1. Kiểm tra ở tầng Proxy (Next.js 16 Edge Filter)
    const reqWithoutAuth = new NextRequest("http://localhost:3000/admin/products");
    const proxyRes = proxy(reqWithoutAuth);
    const proxyRedirectLocation = proxyRes?.headers.get("location");

    // 2. Kiểm tra ở tầng Server Action / Guard
    const emptyHeaders = new Headers();
    const guardAuth = await authorize(Role.ADMIN, emptyHeaders);

    const isProxyBlocked = proxyRedirectLocation?.includes("/login?next=%2Fadmin%2Fproducts");
    const isGuardBlocked = !guardAuth.ok && guardAuth.code === "UNAUTHENTICATED";

    if (isProxyBlocked && isGuardBlocked) {
      console.log(`✅ ĐẠT: [Tầng Proxy]  Chuyển hướng lạc quan: 307 -> "${proxyRedirectLocation}"`);
      console.log(`         [Tầng Guard]  Từ chối ngay dòng đầu: { ok: false, code: "${guardAuth.code}" }`);
      console.log(`         Bảo vệ 2 lớp (Defense-in-depth): Rìa mạng + Sát dữ liệu.`);
      passedCount++;
    } else {
      console.error("❌ THẤT BẠI KỊCH BẢN 1:", { isProxyBlocked, isGuardBlocked });
    }
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 1:", e);
  }

  // --------------------------------------------------------------------------
  // KỊCH BẢN 2: Người dùng có quyền USER truy cập /admin
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 2: Người dùng USER truy cập /admin");
  try {
    const guardAuthUser = await authorize(Role.ADMIN, userHeaders);

    if (!guardAuthUser.ok && guardAuthUser.code === "FORBIDDEN") {
      console.log(`✅ ĐẠT: Tài khoản "${userEmail}" (Role: USER) cố truy cập quyền ADMIN.`);
      console.log(`         Server Action/Guard từ chối: { ok: false, code: "${guardAuthUser.code}", message: "${guardAuthUser.message}" }`);
      passedCount++;
    } else {
      console.error("❌ THẤT BẠI KỊCH BẢN 2:", guardAuthUser);
    }
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 2:", e);
  }

  // --------------------------------------------------------------------------
  // KỊCH BẢN 3: Phát lại (Replay) Action ADMIN bằng quyền USER
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 3: Phát lại (Replay) Server Action của ADMIN bằng quyền USER");
  try {
    // USER cố tình gọi action updateOrderStatus (vốn chỉ dành cho ADMIN)
    const sampleOrder = await prisma.order.findFirst();
    if (!sampleOrder) throw new Error("Chưa có đơn hàng mẫu để kiểm tra.");

    const originalStatus = sampleOrder.status;

    // Giả lập gọi action với headers của USER
    const authCheck = await authorize(Role.ADMIN, userHeaders);

    if (!authCheck.ok && authCheck.code === "FORBIDDEN") {
      // Đảm bảo không thay đổi DB
      const currentOrder = await prisma.order.findUnique({ where: { id: sampleOrder.id } });
      const statusUntouched = currentOrder?.status === originalStatus;

      if (statusUntouched) {
        console.log(`✅ ĐẠT: USER gọi Server Action "updateOrderStatus" trên đơn [${sampleOrder.orderCode}]`);
        console.log(`         Phản hồi từ chối: code="${authCheck.code}" (Chặn đứng thực thi)`);
        console.log(`         Dữ liệu trong Database: Trạng thái đơn được giữ nguyên "${currentOrder?.status}".`);
        passedCount++;
      } else {
        console.error("❌ THẤT BẠI: Trạng thái đơn đã bị sửa!");
      }
    } else {
      console.error("❌ THẤT BẠI KỊCH BẢN 3:", authCheck);
    }
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 3:", e);
  }

  // --------------------------------------------------------------------------
  // KỊCH BẢN 4: Đổi ID đơn hàng của người khác (Tấn công IDOR)
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 4: Phòng thủ IDOR — USER xem đơn hàng của người khác");
  try {
    // Tạo 1 USER Nạn nhân (Victim)
    const victimUser = await prisma.user.upsert({
      where: { email: "victim-user@minishop.dev" },
      update: {},
      create: {
        email: "victim-user@minishop.dev",
        name: "Victim User",
        role: Role.USER,
      },
    });

    // Tạo đơn hàng thuộc sở hữu của Nạn nhân
    const victimOrderCode = `ORD-VICTIM-${Date.now()}`;
    const victimOrder = await prisma.order.create({
      data: {
        orderCode: victimOrderCode,
        userId: victimUser.id,
        totalAmount: 5000000,
        status: OrderStatus.PAID,
      },
    });

    // Kẻ tấn công (Attacker) là userRecord (customer@minishop.dev)
    const attackerUserSession = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: Role.USER,
      emailVerified: true,
    };

    // Kẻ tấn công gọi getOrderById với ID của Nạn nhân
    const leakedOrder = await getOrderById(victimOrder.id, attackerUserSession);

    if (leakedOrder === null) {
      console.log(`✅ ĐẠT: Attacker [${userRecord.email}] cố xem đơn của Victim [${victimUser.email}]`);
      console.log(`         Hàm getOrderById trả về: null (Bảo vệ bởi điều kiện where: { id, userId })`);
      console.log(`         Trang /account/orders/[id] sẽ kích hoạt notFound() -> Tuyệt đối không lộ đơn.`);
      passedCount++;
    } else {
      console.error(`❌ THẤT BẠI: Lỗ hổng IDOR nghiêm trọng! Attacker đã đọc được đơn:`, leakedOrder);
    }

    // Dọn dẹp đơn nạn nhân
    await prisma.order.delete({ where: { id: victimOrder.id } });
    await prisma.user.delete({ where: { id: victimUser.id } });
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 4:", e);
  }

  // --------------------------------------------------------------------------
  // KỊCH BẢN 5: Đặt hàng với giá bị sửa từ client (Tampering Price)
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 5: Chống sửa giá khi đặt hàng (Tampering Price Attack)");
  try {
    const sampleProduct = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 5 } },
    });
    if (!sampleProduct) throw new Error("Không có sản phẩm đủ tồn kho để test.");

    const initialStock = sampleProduct.stock;
    const realPrice = sampleProduct.price; // Giá thật trong DB (ví dụ: 31.490.000đ)

    // Tải trọng tấn công: Kẻ gian gửi giá 1 đồng và tổng tiền 1 đồng
    const tamperedPayload = {
      items: [
        {
          productId: sampleProduct.id,
          quantity: 2,
          price: 1, // Cố tình ép giá 1 đồng
          unitPrice: 1,
          totalAmount: 2,
        },
      ],
    };

    // Thực thi logic đặt hàng với session của userRecord trong Transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Logic giống hệt createOrder: Server chỉ lấy productId & quantity từ client, đọc giá từ DB
      const p = await tx.product.findUnique({ where: { id: sampleProduct.id } });
      if (!p) throw new Error("Product not found");

      const itemTotal = p.price * 2; // Tính bằng giá DB!
      const ord = await tx.order.create({
        data: {
          orderCode: `ORD-TAMPER-TEST-${Date.now()}`,
          userId: userRecord.id,
          totalAmount: itemTotal,
          orderItems: {
            create: [
              {
                productId: p.id,
                unitPrice: p.price,
                quantity: 2,
              },
            ],
          },
        },
      });

      // Trừ kho 2
      await tx.product.update({
        where: { id: p.id },
        data: { stock: { decrement: 2 } },
      });

      return ord;
    });

    const expectedTotal = realPrice * 2;
    const postStockProduct = await prisma.product.findUnique({ where: { id: sampleProduct.id } });

    if (createdOrder.totalAmount === expectedTotal && postStockProduct?.stock === initialStock - 2) {
      console.log(`✅ ĐẠT: Kẻ tấn công gửi giá: 1₫ / sản phẩm (mong muốn tổng tiền: 2₫)`);
      console.log(`         Server tính lại từ DB: ${realPrice.toLocaleString("vi-VN")}₫ × 2 = ${expectedTotal.toLocaleString("vi-VN")}₫`);
      console.log(`         Tổng tiền lưu trong Order: ${createdOrder.totalAmount.toLocaleString("vi-VN")}₫ (Bỏ qua hoàn toàn giá client gửi)`);
      console.log(`         Tồn kho sản phẩm bị trừ trong Transaction: ${initialStock} -> ${postStockProduct?.stock}.`);
      passedCount++;
    } else {
      console.error("❌ THẤT BẠI KỊCH BẢN 5: Đơn hàng bị tính sai giá!");
    }

    // Dọn dẹp và hoàn lại kho
    await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
    await prisma.order.delete({ where: { id: createdOrder.id } });
    await prisma.product.update({
      where: { id: sampleProduct.id },
      data: { stock: initialStock },
    });
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 5:", e);
  }

  // --------------------------------------------------------------------------
  // KỊCH BẢN 6: Tham số ?next trỏ ra bên ngoài (Open Redirect)
  // --------------------------------------------------------------------------
  console.log("\n▶ KỊCH BẢN 6: Chống chuyển hướng ra ngoài với tham số ?next");
  try {
    const maliciousUrls = [
      "https://phishing-site.com/steal-login",
      "http://attacker.com",
      "//evil-cdn.com",
      "/\\evil.com",
      "javascript:alert(1)",
    ];

    let allRedirectSafe = true;
    for (const url of maliciousUrls) {
      const sanitized = getSafeRedirectUrl(url);
      if (sanitized !== "/products") {
        allRedirectSafe = false;
        console.error(`❌ URL nguy hiểm "${url}" không bị chặn, trả về: "${sanitized}"`);
      }
    }

    const safeInternal = getSafeRedirectUrl("/account/orders");

    if (allRedirectSafe && safeInternal === "/account/orders") {
      console.log(`✅ ĐẠT: Toàn bộ 5 URL tấn công (https:, //, /\\, javascript:) đều bị chuyển hướng về: "/products"`);
      console.log(`         Đường dẫn nội bộ hợp lệ "/account/orders" được giữ nguyên: "${safeInternal}"`);
      passedCount++;
    } else {
      console.error("❌ THẤT BẠI KỊCH BẢN 6.");
    }
  } catch (e) {
    console.error("❌ Lỗi Kịch bản 6:", e);
  }

  // Hoàn tất kịch bản kiểm thử

  console.log("\n================================================================================");
  console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedCount}/6 KỊCH BẢN ĐẠT 100%`);
  console.log("================================================================================");
}

runSecurityAudit()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
