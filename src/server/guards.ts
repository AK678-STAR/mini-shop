import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  image?: string | null;
}

export type AuthorizeResult =
  | { ok: true; user: SessionUser }
  | { ok: false; code: "UNAUTHENTICATED" | "FORBIDDEN"; message: string };

/**
 * 1. getSessionUser()
 * Lấy thông tin người dùng từ session đang hoạt động hoặc trả về null nếu chưa đăng nhập.
 * Hỗ trợ truyền overrideHeaders trong môi trường kiểm thử tích hợp.
 */
export async function getSessionUser(overrideHeaders?: Headers): Promise<SessionUser | null> {
  try {
    const reqHeaders = overrideHeaders ?? (await headers());
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      role: (session.user.role as Role) || Role.USER,
      emailVerified: session.user.emailVerified ?? false,
      image: session.user.image ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * 2. requireUser(requiredRole?)
 * Dùng trong Server Component (Trang):
 * - Nếu chưa đăng nhập: chuyển hướng về /login (kèm ?next= để quay lại sau khi đăng nhập).
 * - Nếu yêu cầu vai trò cụ thể (ví dụ: ADMIN) mà user không đáp ứng: chuyển hướng về /products (hoặc từ chối).
 */
export async function requireUser(
  requiredRole?: Role,
  redirectUrl: string = "/login"
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectUrl);
  }

  if (requiredRole && user.role !== requiredRole) {
    redirect("/products");
  }

  return user;
}

/**
 * 3. authorize(requiredRole?, overrideHeaders?)
 * Dùng ở DÒNG ĐẦU TIÊN trong mọi Server Action hoặc Route Handler ghi/đọc dữ liệu nhạy cảm.
 * Trả về đối tượng có cấu trúc { ok: false, code: "UNAUTHENTICATED" | "FORBIDDEN" }
 * thay vì ném lỗi thô (Zero-trust contract).
 */
export async function authorize(
  requiredRole?: Role,
  overrideHeaders?: Headers
): Promise<AuthorizeResult> {
  const user = await getSessionUser(overrideHeaders);

  if (!user) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Yêu cầu đăng nhập để thực hiện thao tác này.",
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Bạn không có quyền thực hiện thao tác này. Cần quyền " + requiredRole + ".",
    };
  }

  return { ok: true, user };
}

export class GuardError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "GuardError";
    this.code = code;
  }
}

/**
 * 4. requireAdmin(redirectUrl?)
 * Dùng tại layout.tsx hoặc Server Component trong khu vực /admin:
 * - Chưa đăng nhập -> Chuyển hướng về trang đăng nhập (/login?next=/admin).
 * - Sai vai trò (role !== Role.ADMIN) -> Chuyển hướng về /products (Từ chối).
 * - Hợp lệ -> Trả về SessionUser.
 */
export async function requireAdmin(
  redirectUrl: string = "/login?next=/admin"
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectUrl);
  }

  if (user.role !== Role.ADMIN) {
    redirect("/products");
  }

  return user;
}

/**
 * 5. assertAdmin(overrideHeaders?)
 * Dùng khi cần kiểm tra quyền ADMIN ném lỗi có mã rõ ràng thay vì redirect (thích hợp cho unit tests / API)
 */
export async function assertAdmin(overrideHeaders?: Headers): Promise<SessionUser> {
  const auth = await authorize(Role.ADMIN, overrideHeaders);
  if (!auth.ok) {
    throw new GuardError(auth.code, auth.message);
  }
  return auth.user;
}
