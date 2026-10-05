import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (Thay thế middleware.ts trong các phiên bản Next.js >= 16)
 * Chức năng: Chuyển hướng "lạc quan" (Optimistic redirect) dựa trên cookie phiên.
 * 
 * ⚠️ LƯU Ý BẢO MẬT QUAN TRỌNG:
 * Proxy chỉ đóng vai trò lọc sớm ở tầng rìa (Edge) để cải thiện trải nghiệm người dùng (UX),
 * TUYỆT ĐỐI KHÔNG ĐƯỢC coi là ranh giới bảo mật duy nhất.
 * Mọi kiểm tra quyền thực sự phải nằm ở phía server, tại Server Component (requireUser)
 * và tại dòng đầu tiên của Server Action/Route Handler (authorize) sát tầng dữ liệu.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Kiểm tra sự tồn tại của Cookie phiên Better Auth
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout");

  // Nếu truy cập route yêu cầu đăng nhập mà không có cookie phiên -> Chuyển hướng lạc quan đến /login
  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const fullTarget = `${pathname}${search}`;
    loginUrl.searchParams.set("next", fullTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
};
