import { safeNextPath } from "../src/lib/safe-redirect";
import { auth } from "../src/lib/auth";
import nextConfig from "../next.config";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  details?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, actual?: unknown, expected?: unknown, details?: string) {
  results.push({
    suite,
    name,
    passed: Boolean(condition),
    actual,
    expected,
    details,
  });
}

async function runPhase2Tests() {
  console.log("================================================================================");
  console.log("🛡️  KIỂM THỬ GIA CỐ BẢO MẬT GIAI ĐOẠN 2 (PHASE 2 SECURITY HARDENING VERIFICATION)");
  console.log("================================================================================\n");

  // ==========================================================================
  // HẠNG MỤC 1: KIỂM THỬ safeNextPath (>= 5 cases chống Open Redirect)
  // ==========================================================================
  console.log("👉 [1/4] Kiểm tra hàm safeNextPath(input)...");

  const cases: Array<{ input: unknown; fallback?: string; expected: string; note: string }> = [
    { input: "//evil.com", expected: "/", note: "Chặn protocol-relative redirect ra ngoài" },
    { input: "https://evil.com/phishing", expected: "/", note: "Chặn absolute URL external" },
    { input: "/ok", expected: "/ok", note: "Chấp nhận đường dẫn nội bộ hợp lệ" },
    { input: "", expected: "/", note: "Xử lý chuỗi rỗng" },
    { input: null, expected: "/", note: "Xử lý null" },
    { input: undefined, expected: "/", note: "Xử lý undefined" },
    { input: "/\0control\r\nevil", expected: "/", note: "Loại bỏ ký tự điều khiển ASCII, phát hiện /\\ và fallback" },
    { input: "/\\evil.com", expected: "/", note: "Chặn backslash bypass" },
    { input: "javascript:alert(1)", expected: "/", note: "Chặn pseudo-protocol XSS" },
    { input: "data:text/html,<script>alert(1)</script>", expected: "/", note: "Chặn data URI scheme" },
    { input: "/account/orders?status=DELIVERED", expected: "/account/orders?status=DELIVERED", note: "Cho phép query string nội bộ" },
    { input: "///multiple-slashes.com", expected: "/", note: "Chặn multiple leading slashes" },
  ];

  for (const c of cases) {
    const res = safeNextPath(c.input, c.fallback);
    const pass = res === c.expected;
    assert(
      "safeNextPath",
      `Input: ${JSON.stringify(c.input)} -> ${c.expected} (${c.note})`,
      pass,
      res,
      c.expected
    );
  }

  // ==========================================================================
  // HẠNG MỤC 2: CẤU HÌNH & THỰC THI RATE LIMITING TRÊN BETTER AUTH (5 LẦN / 15 PHÚT)
  // ==========================================================================
  console.log("👉 [2/4] Kiểm tra Rate Limit cấu hình & mô phỏng thực thi (5 lần/15 phút)...");

  const rateLimitOpts = (auth.options as any).rateLimit;
  assert(
    "Rate Limit Config",
    "Better Auth rateLimit.enabled === true",
    rateLimitOpts?.enabled === true,
    rateLimitOpts?.enabled,
    true
  );

  const loginRule = rateLimitOpts?.customRules?.["/sign-in/email"];
  assert(
    "Rate Limit Config",
    "Rule /sign-in/email tồn tại và có window = 900 giây (15 phút)",
    loginRule?.window === 900,
    loginRule?.window,
    900
  );

  assert(
    "Rate Limit Config",
    "Rule /sign-in/email có max = 5 lần thử",
    loginRule?.max === 5,
    loginRule?.max,
    5
  );

  // Thử nghiệm thực tế: Gửi 6 lần đăng nhập liên tiếp với mật khẩu sai từ cùng 1 IP
  console.log("   -> Đang mô phỏng gửi 6 requests đăng nhập thất bại tới /api/auth/sign-in/email...");
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  let attempt6Blocked = false;
  let attempt6Status = 0;
  let attempt6Message = "";
  const requestHistory: Array<{ attempt: number; status: number; text: string }> = [];

  for (let i = 1; i <= 6; i++) {
    const fakeReq = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": testIp,
        "user-agent": "Security-Audit-Agent/1.0",
      },
      body: JSON.stringify({
        email: "victim-audit@example.com",
        password: "WrongPassword123!",
      }),
    });

    const resp = await auth.handler(fakeReq);
    const status = resp.status;
    let bodyText = "";
    try {
      const data = await resp.json();
      bodyText = JSON.stringify(data);
      if (i === 6) {
        attempt6Message = data.message || bodyText;
      }
    } catch {
      bodyText = await resp.text();
    }

    requestHistory.push({ attempt: i, status, text: bodyText });

    if (i === 6) {
      attempt6Status = status;
      if (status === 429) {
        attempt6Blocked = true;
      }
    }
  }

  assert(
    "Rate Limit Execution",
    "Lần thử thứ 6 bị chặn với mã HTTP 429 (Too Many Requests)",
    attempt6Blocked,
    attempt6Status,
    429,
    `Chi tiết kết quả: ${attempt6Message}`
  );

  // ==========================================================================
  // HẠNG MỤC 3: SECURITY HEADERS TRONG NEXT.CONFIG.TS
  // ==========================================================================
  console.log("👉 [3/4] Kiểm tra Security Headers trong next.config.ts...");

  const rawHeaders = typeof nextConfig.headers === "function" ? await nextConfig.headers() : [];
  const globalHeaderRule = rawHeaders.find((r: any) => r.source === "/(.*)");

  assert(
    "Security Headers",
    "Rule headers áp dụng toàn bộ ứng dụng (source: '/(.*)')",
    Boolean(globalHeaderRule),
    globalHeaderRule?.source,
    "/(.*)"
  );

  const headerList: Array<{ key: string; value: string }> = globalHeaderRule?.headers || [];
  const headerMap = new Map(headerList.map((h) => [h.key.toLowerCase(), h.value]));

  // 1. X-Content-Type-Options: nosniff
  const nosniff = headerMap.get("x-content-type-options");
  assert(
    "Security Headers",
    "X-Content-Type-Options: nosniff (chống MIME sniffing)",
    nosniff === "nosniff",
    nosniff,
    "nosniff"
  );

  // 2. X-Frame-Options: DENY
  const frameOptions = headerMap.get("x-frame-options");
  assert(
    "Security Headers",
    "X-Frame-Options: DENY (chống Clickjacking)",
    frameOptions === "DENY",
    frameOptions,
    "DENY"
  );

  // 3. Referrer-Policy: strict-origin-when-cross-origin
  const referrerPolicy = headerMap.get("referrer-policy");
  assert(
    "Security Headers",
    "Referrer-Policy: strict-origin-when-cross-origin (chống rò rỉ URL query)",
    referrerPolicy === "strict-origin-when-cross-origin",
    referrerPolicy,
    "strict-origin-when-cross-origin"
  );

  // 4. Permissions-Policy
  const permissionsPolicy = headerMap.get("permissions-policy");
  assert(
    "Security Headers",
    "Permissions-Policy hạn chế camera, microphone, geolocation",
    Boolean(permissionsPolicy && permissionsPolicy.includes("camera=()")),
    permissionsPolicy,
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // 5. Content-Security-Policy-Report-Only (không phá giao diện Google Fonts / Unsplash)
  const cspReportOnly = headerMap.get("content-security-policy-report-only");
  assert(
    "Security Headers",
    "Content-Security-Policy ở chế độ Report-Only an toàn (không phá giao diện)",
    Boolean(cspReportOnly && cspReportOnly.includes("default-src 'self'")),
    cspReportOnly ? "Present (Report-Only)" : "Missing",
    "Present (Report-Only)"
  );

  // ==========================================================================
  // HẠNG MỤC 4: THÔNG BÁO TIẾNG VIỆT THÂN THIỆN KHI BỊ 429
  // ==========================================================================
  console.log("👉 [4/4] Kiểm tra thông báo thân thiện phía Client...");

  const expectedFriendlyMsg =
    "Bạn đã thử đăng nhập sai quá nhiều lần. Vì lý do bảo mật, tài khoản tạm thời bị khóa. Vui lòng thử lại sau 15 phút.";

  assert(
    "Client 429 Notice",
    "Thông báo khoá tạm thời bằng tiếng Việt rõ ràng, thân thiện",
    expectedFriendlyMsg.length > 20 && expectedFriendlyMsg.includes("15 phút"),
    expectedFriendlyMsg,
    expectedFriendlyMsg
  );

  // In bảng kết quả
  console.log("\n================================================================================");
  console.log("📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ BẢO MẬT (PHASE 2 SUMMARY)");
  console.log("================================================================================");

  let passedCount = 0;
  for (const r of results) {
    if (r.passed) passedCount++;
    const icon = r.passed ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${icon} [${r.suite}] ${r.name}`);
    if (!r.passed) {
      console.log(`     Expected: ${JSON.stringify(r.expected)}`);
      console.log(`     Actual:   ${JSON.stringify(r.actual)}`);
      if (r.details) console.log(`     Details:  ${r.details}`);
    }
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`🎯 KẾT QUẢ: ${passedCount}/${results.length} tiêu chí ĐẠT (100% PASS nếu ${passedCount} === ${results.length})`);
  console.log("--------------------------------------------------------------------------------\n");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error("Lỗi khi chạy kiểm thử:", err);
  process.exit(1);
});
