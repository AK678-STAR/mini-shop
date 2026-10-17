import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SepayWebhookBody, extractOrderCodeFromContent } from "@/lib/sepay";

/**
 * GET: Endpoint kiểm tra tình trạng hoạt động (Health check)
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Mini Shop SePay Webhook",
    message: "Endpoint webhook SePay đã sẵn sàng tiếp nhận dữ liệu thanh toán.",
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST: Tiếp nhận và xử lý Webhook từ SePay khi có biến động số dư (tiền vào)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực bảo mật (Nếu đã cấu hình SEPAY_WEBHOOK_KEY hoặc SEPAY_API_KEY)
    const expectedKey = process.env.SEPAY_WEBHOOK_KEY || process.env.SEPAY_API_KEY;
    if (expectedKey) {
      const authHeader = req.headers.get("authorization") || "";
      const isAuthorized =
        authHeader === `Apikey ${expectedKey}` ||
        authHeader === `Bearer ${expectedKey}` ||
        authHeader === expectedKey;

      if (!isAuthorized) {
        console.warn("[SePay Webhook] Xác thực thất bại: Header authorization không khớp key.");
        return NextResponse.json(
          { success: false, message: "Unauthorized SePay webhook request" },
          { status: 401 }
        );
      }
    }

    // 2. Parse dữ liệu JSON từ SePay
    const body: SepayWebhookBody = await req.json();
    const { transferType, transferAmount, content, gateway, referenceCode } = body;

    console.log(`[SePay Webhook] Nhận giao dịch mới: ${gateway || "Bank"} | Số tiền: ${transferAmount} | Nội dung: "${content}"`);

    // Chỉ xử lý giao dịch tiền vào (tiền nạp/chuyển khoản đến)
    if (transferType && transferType !== "in") {
      return NextResponse.json({
        success: true,
        message: "Bỏ qua: Giao dịch không phải loại 'tiền vào' (transferType !== 'in')",
      });
    }

    const amount = Number(transferAmount);
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: true,
        message: "Bỏ qua: Số tiền giao dịch không hợp lệ",
      });
    }

    // 3. Trích xuất mã đơn hàng từ nội dung chuyển khoản
    const combinedText = `${content || ""} ${body.description || ""}`;
    const orderCodeCandidate = extractOrderCodeFromContent(combinedText);

    if (!orderCodeCandidate) {
      console.log(`[SePay Webhook] Không tìm thấy mã đơn hàng phù hợp trong nội dung: "${combinedText}"`);
      return NextResponse.json({
        success: true,
        message: "Đã nhận webhook, không tìm thấy mã đơn hàng trong nội dung chuyển khoản",
      });
    }

    // 4. Tìm kiếm đơn hàng tương ứng trong Cơ sở dữ liệu
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderCode: orderCodeCandidate },
          { orderCode: { equals: orderCodeCandidate, mode: "insensitive" } },
          { id: orderCodeCandidate },
        ],
      },
    });

    if (!order) {
      console.warn(`[SePay Webhook] Không tìm thấy đơn hàng trong hệ thống với mã: "${orderCodeCandidate}"`);
      return NextResponse.json({
        success: true,
        message: `Đã nhận webhook, không tìm thấy đơn hàng mã ${orderCodeCandidate}`,
      });
    }

    // 5. Kiểm tra nếu đơn hàng đã được thanh toán trước đó
    if (order.status === OrderStatus.PAID) {
      return NextResponse.json({
        success: true,
        message: `Đơn hàng [${order.orderCode}] đã ở trạng thái ĐÃ THANH TOÁN trước đó`,
        orderCode: order.orderCode,
      });
    }

    // 6. Kiểm tra số tiền chuyển khoản có đủ thanh toán đơn hàng không
    if (amount < order.totalAmount) {
      console.warn(
        `[SePay Webhook] Đơn hàng [${order.orderCode}] nhận thiếu tiền: Cần ${order.totalAmount} VNĐ nhưng chỉ nhận ${amount} VNĐ`
      );
      return NextResponse.json({
        success: true,
        message: `Đã ghi nhận giao dịch: Số tiền (${amount} VNĐ) chưa đủ tổng đơn (${order.totalAmount} VNĐ)`,
        orderCode: order.orderCode,
      });
    }

    // 7. Cập nhật trạng thái đơn hàng sang PAID (Đã thanh toán)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        updatedAt: new Date(),
      },
    });

    console.log(
      `🎉 [SePay Webhook] Xác nhận thanh toán thành công cho đơn hàng [${updatedOrder.orderCode}]! Ref: ${referenceCode || "N/A"}`
    );

    // Làm mới cache các trang quản lý và lịch sử đơn hàng
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${order.id}`);

    return NextResponse.json({
      success: true,
      message: `Xác nhận thanh toán đơn hàng [${updatedOrder.orderCode}] thành công`,
      orderCode: updatedOrder.orderCode,
      totalAmount: updatedOrder.totalAmount,
    });
  } catch (error: any) {
    console.error("[SePay Webhook Error]", error?.message || error);
    // Trả về lỗi server nhưng không làm lộ chi tiết cấu trúc hệ thống
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý webhook nội bộ hệ thống" },
      { status: 500 }
    );
  }
}
