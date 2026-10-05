import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";

/**
 * Cấu hình Better Auth cho Mini Shop
 * - Adapter: Prisma Adapter (PostgreSQL 16)
 * - Email & Password Authentication
 * - Role: input: false (Client không thể tự gán role)
 * - Rate limit: Chống brute-force đăng nhập
 * - Cookie: HttpOnly, Secure, SameSite tự động theo môi trường
 */
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false, // CRITICAL: Không cho phép client truyền role khi đăng ký
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      // Giới hạn đăng nhập: Tối đa 5 lần thử trong 15 phút (900 giây)
      "/sign-in/email": {
        window: 15 * 60, // 900 giây
        max: 5,          // Tối đa 5 lần
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [
    nextCookies(), // Plugin đồng bộ cookie cho Server Actions và Route Handlers
  ],
});
