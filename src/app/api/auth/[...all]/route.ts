import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Next.js Route Handler cho Better Auth
 * Đón nhận toàn bộ request xác thực:
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/get-session
 */
export const { GET, POST } = toNextJsHandler(auth.handler);
