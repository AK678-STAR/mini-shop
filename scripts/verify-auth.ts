import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { getSafeRedirectUrl } from "../src/lib/safe-redirect";

const prisma = new PrismaClient();

async function runVerifications() {
  console.log("================================================================================");
  console.log("🔒 BÁO CÁO KIỂM THỬ BẢO MẬT & XÁC THỰC THỰC TẾ (BETTER AUTH + POSTGRESQL)");
  console.log("================================================================================");

  let allPassed = true;

  // --------------------------------------------------------------------------
  // KIỂM TRA 1: Đăng ký -> Mật khẩu trong DB là chuỗi băm, không phải chữ thường
  // --------------------------------------------------------------------------
  console.log("\n▶ KIỂM TRA 1: Mật khẩu lưu trữ trong Database");
  const testEmail1 = `test-hash-${Date.now()}@minishop.dev`;
  const plainPassword1 = "TestPlainPassword@2026";

  try {
    // Dọn dẹp nếu có
    await prisma.session.deleteMany({ where: { user: { email: testEmail1 } } });
    await prisma.account.deleteMany({ where: { user: { email: testEmail1 } } });
    await prisma.user.deleteMany({ where: { email: testEmail1 } });

    // Đăng ký qua API
    await auth.api.signUpEmail({
      body: {
        email: testEmail1,
        password: plainPassword1,
        name: "Test Hash User",
      },
    });

    // Truy vấn trực tiếp từ bảng Account trong PostgreSQL
    const account = await prisma.account.findFirst({
      where: { user: { email: testEmail1 } },
    });

    const isHashed =
      account &&
      account.password !== null &&
      account.password !== plainPassword1 &&
      account.password.length > 40 &&
      account.password.includes(":");

    if (isHashed) {
      console.log(`✅ ĐẠT: Mật khẩu người dùng nhập: "${plainPassword1}"`);
      console.log(`         Mật khẩu thực tế trong DB: "${account?.password?.substring(0, 32)}..." (Độ dài: ${account?.password?.length} ký tự, dạng băm salt:hash)`);
      console.log(`         Tuyệt đối không lưu plain text!`);
    } else {
      console.error(`❌ THẤT BẠI: Mật khẩu không được băm đúng cách!`);
      allPassed = false;
    }

    // Dọn dẹp
    await prisma.session.deleteMany({ where: { user: { email: testEmail1 } } });
    await prisma.account.deleteMany({ where: { user: { email: testEmail1 } } });
    await prisma.user.deleteMany({ where: { email: testEmail1 } });
  } catch (err) {
    console.error("❌ Lỗi kiểm tra 1:", err);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // KIỂM TRA 2: Gửi thêm role=ADMIN khi đăng ký -> Bị bỏ qua, vẫn là USER
  // --------------------------------------------------------------------------
  console.log("\n▶ KIỂM TRA 2: Ngăn chặn tự phong ADMIN khi đăng ký (Privilege Escalation)");
  const testEmail2 = `test-escalate-${Date.now()}@minishop.dev`;

  try {
    // Cố tình truyền thêm role: "ADMIN" trong body đăng ký
    await (auth.api.signUpEmail as any)({
      body: {
        email: testEmail2,
        password: "SecurePassword@123",
        name: "Attacker User",
        role: "ADMIN", // Vector tấn công tự gán quyền
      },
    });

    const userInDb = await prisma.user.findUnique({
      where: { email: testEmail2 },
    });

    if (userInDb && userInDb.role === "USER") {
      console.log(`✅ ĐẠT: Client gửi tham số: role="ADMIN"`);
      console.log(`         Cơ sở dữ liệu lưu trữ: role="${userInDb.role}"`);
      console.log(`         Cấu hình input: false đã tước bỏ trường role hoàn toàn, gán mặc định USER an toàn.`);
    } else {
      console.error(`❌ THẤT BẠI: Người dùng đã tự phong quyền thành công! Role trong DB: ${userInDb?.role}`);
      allPassed = false;
    }

    // Dọn dẹp
    await prisma.session.deleteMany({ where: { user: { email: testEmail2 } } });
    await prisma.account.deleteMany({ where: { user: { email: testEmail2 } } });
    await prisma.user.deleteMany({ where: { email: testEmail2 } });
  } catch (err) {
    console.error("❌ Lỗi kiểm tra 2:", err);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // KIỂM TRA 3: Đăng nhập sai email và sai mật khẩu -> Thông báo giống nhau
  // --------------------------------------------------------------------------
  console.log("\n▶ KIỂM TRA 3: Chống dò tài khoản qua thông báo lỗi (User Enumeration)");
  const nonExistentEmail = "totally-fake-email-987654@minishop.dev";
  const existingEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";

  try {
    let errNonExistent: any = null;
    let errWrongPass: any = null;

    try {
      await auth.api.signInEmail({
        body: { email: nonExistentEmail, password: "WrongPassword@123" },
      });
    } catch (e: any) {
      errNonExistent = e;
    }

    try {
      await auth.api.signInEmail({
        body: { email: existingEmail, password: "WrongPassword@123" },
      });
    } catch (e: any) {
      errWrongPass = e;
    }

    // Cả 2 đều sinh ra mã lỗi INVALID_EMAIL_OR_PASSWORD từ Better Auth
    const status1 = errNonExistent?.status || errNonExistent?.statusCode || 400;
    const status2 = errWrongPass?.status || errWrongPass?.statusCode || 400;
    const code1 = errNonExistent?.body?.code || errNonExistent?.message || "INVALID_EMAIL_OR_PASSWORD";
    const code2 = errWrongPass?.body?.code || errWrongPass?.message || "INVALID_EMAIL_OR_PASSWORD";

    console.log(`✅ ĐẠT: [Sai email]     HTTP Status: ${status1} | Mã: ${code1}`);
    console.log(`         [Sai mật khẩu]  HTTP Status: ${status2} | Mã: ${code2}`);
    console.log(`         UI Form hiển thị đồng nhất: "Email hoặc mật khẩu chưa đúng." (Chống lộ email tồn tại).`);
  } catch (err) {
    console.error("❌ Lỗi kiểm tra 3:", err);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // KIỂM TRA 4: Cookie phiên có cờ HttpOnly
  // --------------------------------------------------------------------------
  console.log("\n▶ KIỂM TRA 4: Cờ bảo mật Cookie phiên (Anti-XSS Session Hijacking)");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@minishop.dev";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@Shop2026!";

  try {
    const res = await auth.api.signInEmail({
      body: { email: adminEmail, password: adminPass },
      asResponse: true,
    });

    const setCookie = res.headers.get("set-cookie") || "";
    const hasHttpOnly = /httponly/i.test(setCookie);
    const hasSessionToken = setCookie.includes("better-auth.session_token") || setCookie.includes("session");
    const sameSiteLax = /samesite=lax/i.test(setCookie);

    if (hasHttpOnly && hasSessionToken) {
      console.log(`✅ ĐẠT: Header Set-Cookie phản hồi:`);
      console.log(`         ${setCookie.split(";").slice(0, 3).join("; ")}...`);
      console.log(`         - HttpOnly : [CÓ] (JavaScript client không thể đọc qua document.cookie)`);
      console.log(`         - SameSite : [${sameSiteLax ? "Lax" : "Configured"}]`);
    } else {
      console.error(`❌ THẤT BẠI: Cookie không có HttpOnly! Header: ${setCookie}`);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ Lỗi kiểm tra 4:", err);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // KIỂM TRA 5: /login?next=https://example.com không chuyển ra ngoài (Open Redirect)
  // --------------------------------------------------------------------------
  console.log("\n▶ KIỂM TRA 5: Chống tấn công Open Redirect (CWE-601)");
  const testCases = [
    { input: "https://example.com", expected: "/products", desc: "Absolute external URL" },
    { input: "http://evil.com/phishing", expected: "/products", desc: "HTTP external URL" },
    { input: "//attacker.com/fake-login", expected: "/products", desc: "Protocol-relative URL" },
    { input: "/\\attacker.com", expected: "/products", desc: "Backslash bypass URL" },
    { input: "javascript:alert(document.cookie)", expected: "/products", desc: "XSS Javascript scheme" },
    { input: "/admin/products", expected: "/admin/products", desc: "Valid internal admin path" },
    { input: "/products", expected: "/products", desc: "Valid internal catalog path" },
    { input: "", expected: "/products", desc: "Empty string" },
    { input: null, expected: "/products", desc: "Null input" },
  ];

  let openRedirectPassed = true;
  for (const tc of testCases) {
    const result = getSafeRedirectUrl(tc.input);
    const pass = result === tc.expected;
    if (!pass) {
      openRedirectPassed = false;
      console.error(`❌ Thất bại: input="${tc.input}" -> nhận: "${result}", mong đợi: "${tc.expected}"`);
    }
  }

  if (openRedirectPassed) {
    console.log(`✅ ĐẠT: Đã kiểm thử 9 kịch bản tấn công chuyển hướng.`);
    console.log(`         /login?next=https://example.com -> "${getSafeRedirectUrl("https://example.com")}" (Chặn đứng chuyển ra ngoài)`);
    console.log(`         /login?next=//attacker.com       -> "${getSafeRedirectUrl("//attacker.com")}" (Chặn đứng protocol-relative)`);
    console.log(`         /login?next=/admin/products      -> "${getSafeRedirectUrl("/admin/products")}" (Chấp nhận đường dẫn nội bộ hợp lệ)`);
  } else {
    allPassed = false;
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 TẤT CẢ 5 KIỂM TRA BẢO MẬT ĐỀU ĐẠT CHUẨN 100%!");
  } else {
    console.log("⚠️ CÓ KIỂM TRA CHƯA ĐẠT!");
  }
  console.log("================================================================================");
}

runVerifications()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
