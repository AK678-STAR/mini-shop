import "server-only";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { safeLogError } from "@/lib/logger";

export interface CreateAuditLogParams {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
}

/**
 * Ghi nhật ký kiểm toán (Audit Log) theo mô hình Append-Only
 * Bảng audit_logs được bảo vệ ở cấp độ Database:
 * - CẤM TUYỆT ĐỐI mọi hành vi UPDATE hoặc DELETE.
 * - Chỉ cho phép INSERT và SELECT.
 */
export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        before: params.before ?? Prisma.JsonNull,
        after: params.after ?? Prisma.JsonNull,
      },
    });
    return log;
  } catch (error) {
    safeLogError("Lỗi khi ghi nhật ký kiểm toán (Audit Log)", error);
    return null;
  }
}

/**
 * Lấy danh sách nhật ký kiểm toán mới nhất phục vụ trang quản trị
 */
export async function getLatestAuditLogs(limit: number = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });
}
