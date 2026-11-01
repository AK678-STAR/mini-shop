import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/app/actions/analytics";

/**
 * Route Handler: POST /api/analytics
 * Nhận sự kiện từ client và chuyển tiếp an toàn tới tầng lưu trữ
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await trackAnalyticsEvent(body);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message || "Yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }
}

