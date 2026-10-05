import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { authorize, getSessionUser, requireUser } from "../src/server/guards";
import { getOrderById } from "../src/server/orders";
import { deleteProduct, updateProduct, createProduct } from "../src/app/actions/product";
import { updateOrderStatus, createOrder } from "../src/app/actions/order";
import { getSafeRedirectUrl } from "../src/lib/safe-redirect";
import { proxy } from "../src/proxy";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

async function evaluateAll8Items() {
  console.log("================================================================================");
  console.log("🧪 THỰC THI KIỂM CHỨNG THỰC TẾ 8 HẠNG MỤC TẤN CÔNG CHÉO (CROSS-ATTACK AUDIT)");
  console.log("================================================================================");

  const results: Record<number, { name: string; predicted: string; actual: string; evidence: string }> = {};

  const adminEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";
  const userEmail = "customer@minishop.dev";
  const userPassword = "Customer@Shop2026!";

  // 1. Tạo session USER hợp lệ
  const userLoginRes = await auth.api.signInEmail({
    body: { email: userEmail, password: userPassword },
    asResponse: true,
  });
  const userSetCookie = userLoginRes.headers.get("set-cookie") || "";
  const userCookiePart = userSetCookie.split(";")[0];
  const userHeaders = new Headers();
  userHeaders.set("cookie", userCookiePart);

  // --------------------------------------------------------------------------
  // HẠNG MỤC 1: Chưa đăng nhập vào /admin
  // --------------------------------------------------------------------------
  try {
    const req = new NextRequest("http://localhost:3000/admin/products");
    const proxyRes = proxy(req);
    const redirectLoc = proxyRes?.headers.get("location");
    const guardAuth = await authorize(Role.ADMIN, new Headers());

    const pass = redirectLoc?.includes("/login?next=%2Fadmin%2Fproducts") && !guardAuth.ok && guardAuth.code === "UNAUTHENTICATED";
    const guardCode = !guardAuth.ok ? guardAuth.code : "OK";
    results[1] = {
      name: "Chưa đăng nhập vào /admin",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `Proxy 307 -> ${redirectLoc} | Guard Action: { ok: false, code: "${guardCode}" }`,
    };
  } catch (e: any) {
    results[1] = { name: "Chưa đăng nhập vào /admin", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 2: USER vào /admin
  // --------------------------------------------------------------------------
  try {
    const guardAuth = await authorize(Role.ADMIN, userHeaders);
    const pass = !guardAuth.ok && guardAuth.code === "FORBIDDEN";
    const guardCode2 = !guardAuth.ok ? guardAuth.code : "OK";
    const guardMsg2 = !guardAuth.ok ? guardAuth.message : "";
    results[2] = {
      name: "USER vào /admin",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `User: ${userEmail} (Role: USER) | Guard: { ok: false, code: "${guardCode2}", message: "${guardMsg2}" }`,
    };
  } catch (e: any) {
    results[2] = { name: "USER vào /admin", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 3: Phát lại action sau khi đăng xuất
  // --------------------------------------------------------------------------
  try {
    // Tạo 1 session riêng để test đăng xuất
    const tempLoginRes = await auth.api.signInEmail({
      body: { email: userEmail, password: userPassword },
      asResponse: true,
    });
    const tempCookie = tempLoginRes.headers.get("set-cookie") || "";
    const tempCookiePart = tempCookie.split(";")[0];
    const tempHeaders = new Headers();
    tempHeaders.set("cookie", tempCookiePart);

    // Xác nhận session hoạt động trước khi đăng xuất
    const beforeLogout = await getSessionUser(tempHeaders);

    // Thực hiện đăng xuất (revoke/delete session trong Better Auth)
    await auth.api.signOut({ headers: tempHeaders });

    // Phát lại gọi action với session đã đăng xuất
    const afterLogoutGuard = await authorize(undefined, tempHeaders);
    const pass = beforeLogout !== null && !afterLogoutGuard.ok && afterLogoutGuard.code === "UNAUTHENTICATED";
    const afterCode = !afterLogoutGuard.ok ? afterLogoutGuard.code : "OK";

    results[3] = {
      name: "Phát lại action sau khi đăng xuất",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `Trước logout: Session=${beforeLogout?.email} | Sau logout: Session đã thu hồi, Action trả về: { ok: false, code: "${afterCode}" }`,
    };
  } catch (e: any) {
    results[3] = { name: "Phát lại action sau khi đăng xuất", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 4: Phát lại action ADMIN bằng USER
  // --------------------------------------------------------------------------
  try {
    const adminActionGuard = await authorize(Role.ADMIN, userHeaders);
    const pass = !adminActionGuard.ok && adminActionGuard.code === "FORBIDDEN";
    const adminActionCode = !adminActionGuard.ok ? adminActionGuard.code : "OK";

    results[4] = {
      name: "Phát lại action ADMIN bằng USER",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `USER cố gọi action ADMIN | Server Action chặn ngay dòng đầu: { ok: false, code: "${adminActionCode}" }`,
    };
  } catch (e: any) {
    results[4] = { name: "Phát lại action ADMIN bằng USER", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 5: Đổi ID đơn hàng (IDOR)
  // --------------------------------------------------------------------------
  try {
    const victim = await prisma.user.upsert({
      where: { email: "victim-audit@minishop.dev" },
      update: {},
      create: { email: "victim-audit@minishop.dev", name: "Victim Audit", role: Role.USER },
    });
    const victimOrder = await prisma.order.create({
      data: {
        orderCode: `ORD-AUDIT-${Date.now()}`,
        userId: victim.id,
        totalAmount: 1000000,
        status: OrderStatus.PENDING,
      },
    });

    const attackerSession = {
      id: "attacker-user-id",
      email: userEmail,
      name: "Attacker",
      role: Role.USER,
      emailVerified: true,
    };

    const leaked = await getOrderById(victimOrder.id, attackerSession);
    const pass = leaked === null;

    results[5] = {
      name: "Đổi ID đơn hàng (IDOR)",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `Attacker truy vấn orderId="${victimOrder.id}" của Victim -> getOrderById trả về: ${leaked} (Chặn đứng IDOR bằng where: { id, userId })`,
    };

    await prisma.order.delete({ where: { id: victimOrder.id } });
    await prisma.user.delete({ where: { id: victim.id } });
  } catch (e: any) {
    results[5] = { name: "Đổi ID đơn hàng (IDOR)", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 6: Tự phong ADMIN khi đăng ký
  // --------------------------------------------------------------------------
  try {
    const testRegEmail = `test-role-audit-${Date.now()}@minishop.dev`;
    await (auth.api.signUpEmail as any)({
      body: {
        email: testRegEmail,
        password: "AuditPassword@123",
        name: "Role Hacker",
        role: "ADMIN",
      },
    });

    const createdUser = await prisma.user.findUnique({ where: { email: testRegEmail } });
    const pass = createdUser?.role === "USER";

    results[6] = {
      name: "Tự phong ADMIN khi đăng ký",
      predicted: "Đạt",
      actual: pass ? "Đạt" : "Lỗi",
      evidence: `Payload gửi role="ADMIN" -> DB lưu role="${createdUser?.role}" (Do cấu hình input: false tước bỏ role)`,
    };

    await prisma.session.deleteMany({ where: { user: { email: testRegEmail } } });
    await prisma.account.deleteMany({ where: { user: { email: testRegEmail } } });
    await prisma.user.deleteMany({ where: { email: testRegEmail } });
  } catch (e: any) {
    results[6] = { name: "Tự phong ADMIN khi đăng ký", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 7: Open redirect ở ?next
  // --------------------------------------------------------------------------
  try {
    const evil1 = getSafeRedirectUrl("https://evil.com");
    const evil2 = getSafeRedirectUrl("//attacker.com");
    const evil3 = getSafeRedirectUrl("/\\attacker.com");
    const evil4 = getSafeRedirectUrl("javascript:alert(1)");
    const internal = getSafeRedirectUrl("/account/orders");

    // Lưu ý: hàm hiện tại getSafeRedirectUrl trả về "/products" khi không hợp lệ, trong khi prompt yêu cầu safeNextPath trả về "/"
    const isCurrentSafe = evil1 === "/products" && evil2 === "/products" && evil3 === "/products" && evil4 === "/products" && internal === "/account/orders";

    results[7] = {
      name: "Open redirect ở ?next",
      predicted: "Đạt một phần (Cần chỉnh tên hàm & fallback '/')",
      actual: isCurrentSafe ? "Đạt một phần" : "Lỗi",
      evidence: `https://evil.com -> "${evil1}" (chặn ra ngoài); //attacker.com -> "${evil2}". Cần chuẩn hóa tên safeNextPath và fallback về "/" theo hợp đồng.`,
    };
  } catch (e: any) {
    results[7] = { name: "Open redirect ở ?next", predicted: "Đạt một phần", actual: "Lỗi", evidence: e.message };
  }

  // --------------------------------------------------------------------------
  // HẠNG MỤC 8: Thông báo lỗi và rò rỉ trường (passwordHash)
  // --------------------------------------------------------------------------
  try {
    // 1. Kiểm tra session/user có lộ password hoặc passwordHash
    const sampleUser = await prisma.user.findFirst({
      include: { sessions: true },
    });
    const sessionObj = await auth.api.getSession({ headers: userHeaders });
    const userKeys = Object.keys(sessionObj?.user || {});
    const hasPasswordInSession = userKeys.includes("password") || userKeys.includes("passwordHash");

    // 2. Kiểm tra thông báo đăng nhập sai email vs sai pass
    let errCode1 = "";
    let errCode2 = "";
    try {
      await auth.api.signInEmail({ body: { email: "nonexistent@minishop.dev", password: "WrongPassword@123" } });
    } catch (e: any) {
      errCode1 = e?.body?.code || e?.message || "INVALID_EMAIL_OR_PASSWORD";
    }
    try {
      await auth.api.signInEmail({ body: { email: adminEmail, password: "WrongPassword@123" } });
    } catch (e: any) {
      errCode2 = e?.body?.code || e?.message || "INVALID_EMAIL_OR_PASSWORD";
    }

    const sameErrorCode = errCode1 === errCode2;
    const noLeak = !hasPasswordInSession;

    results[8] = {
      name: "Thông báo lỗi và rò rỉ trường (passwordHash)",
      predicted: "Đạt",
      actual: sameErrorCode && noLeak ? "Đạt" : "Lỗi",
      evidence: `Sai email code="${errCode1}" === Sai pass code="${errCode2}" | Session keys=[${userKeys.join(", ")}] (Không có password/hash)`,
    };
  } catch (e: any) {
    results[8] = { name: "Thông báo lỗi và rò rỉ trường (passwordHash)", predicted: "Đạt", actual: "Lỗi", evidence: e.message };
  }

  console.log("\nKẾT QUẢ KIỂM CHỨNG THỰC TẾ:");
  for (let i = 1; i <= 8; i++) {
    const r = results[i];
    console.log(`[#${i}] ${r.name}`);
    console.log(`      Dự đoán: ${r.predicted} | Thực tế: ${r.actual}`);
    console.log(`      Bằng chứng: ${r.evidence}`);
  }
  console.log("================================================================================");
}

evaluateAll8Items()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
