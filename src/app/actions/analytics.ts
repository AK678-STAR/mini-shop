"use server";

import prisma from "@/lib/prisma";
import { AnalyticsEventSchema } from "@/lib/validators/analytics";

// Giới hạn tần suất bộ nhớ trượt: tối đa 60 sự kiện / phút cho mỗi client
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkSimpleRateLimit(clientId: string = "anon"): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const current = rateLimitMap.get(clientId);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= 60) {
    return false;
  }

  current.count++;
  return true;
}

export interface TrackEventResult {
  ok: boolean;
  message?: string;
  id?: string;
}

/**
 * Ghi nhận sự kiện phân tích tối giản, tôn trọng quyền riêng tư
 * - Bỏ qua trường lạ (Zero PII - không lưu email, ip, full user agent hay từ khóa tìm kiếm)
 * - Tên sự kiện theo allowlist chặt chẽ
 * - Ghi bất đồng bộ, không làm nghẽn phản hồi trang
 */
export async function trackAnalyticsEvent(
  rawInput: unknown,
  clientId: string = "anon"
): Promise<TrackEventResult> {
  // 1. Kiểm tra rate limit đơn giản
  if (!checkSimpleRateLimit(clientId)) {
    return { ok: false, message: "Hệ thống đang bận. Vui lòng thử lại sau." };
  }

  // 2. Xác thực và loại bỏ trường lạ
  const parseResult = AnalyticsEventSchema.safeParse(rawInput);
  if (!parseResult.success) {
    // Trả về lỗi chung chung, không lộ chi tiết nội bộ
    return { ok: false, message: "Yêu cầu không hợp lệ." };
  }

  const { name, productId, lang } = parseResult.data;

  try {
    const record = await prisma.analyticsEvent.create({
      data: {
        name,
        productId: productId || null,
        lang,
      },
      select: { id: true },
    });

    return { ok: true, id: record.id };
  } catch {
    return { ok: false, message: "Hệ thống gặp sự cố khi xử lý dữ liệu." };
  }
}

