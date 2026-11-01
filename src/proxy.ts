import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "vi";

/**
 * Next.js 16 Proxy (Thay thế middleware.ts trong các phiên bản Next.js >= 16)
 * Thứ tự xử lý chuẩn xác:
 * 1. Bỏ qua file tĩnh, Next.js internal, API và SEO routes
 * 2. Bảo vệ phân quyền 4 tầng: Chặn /admin, /account, /checkout nếu chưa đăng nhập
 * 3. Quốc tế hóa (i18n):
 *    - /vi/... và /en/... -> Gán header 'x-locale' và rewrite an toàn
 *    - Mã ngôn ngữ lạ (ví dụ /fr/...) -> Trả về mã lỗi 404 Not Found
 *    - URL công khai thiếu tiền tố -> Chuyển hướng không lặp tới /vi
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BỎ QUA CÁC ROUTE KỸ THUẬT, API VÀ FILE TĨNH
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.includes(".") // .ico, .svg, .png, .css, .js
  ) {
    return NextResponse.next();
  }

  // 2. PHÂN QUYỀN 4 TẦNG HIỆN CÓ (BẢO TOÀN NGUYÊN VẸN)
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout");

  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const fullTarget = `${pathname}${search}`;
    loginUrl.searchParams.set("next", fullTarget);
    return NextResponse.redirect(loginUrl);
  }

  // Khu vực quản trị và xác thực không gắn tiền tố i18n
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // 3. i18n ROUTING & CHUYỂN HƯỚNG AN TOÀN
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // Nếu đã có tiền tố hợp lệ ('vi' hoặc 'en')
  if (firstSegment && (SUPPORTED_LOCALES as readonly string[]).includes(firstSegment)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", firstSegment);

    // Xóa tiền tố ngôn ngữ để map về route tương ứng trong App Router
    const strippedPath = "/" + segments.slice(1).join("/");
    const rewriteUrl = new URL(`${strippedPath === "/" ? "/products" : strippedPath}${search}`, request.url);

    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Nếu có tiền tố ngôn ngữ lạ 2 ký tự (ví dụ: /fr, /ja, /de) -> Trả về 404
  if (firstSegment && firstSegment.length === 2 && !(SUPPORTED_LOCALES as readonly string[]).includes(firstSegment)) {
    return new NextResponse("Ngôn ngữ không được hỗ trợ (Language not supported).", { status: 404 });
  }

  // Nếu không có tiền tố ngôn ngữ -> Chuyển hướng không lặp tới /vi
  const targetPath = pathname === "/" ? "/vi/products" : `/vi${pathname}`;
  const redirectUrl = new URL(`${targetPath}${search}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
