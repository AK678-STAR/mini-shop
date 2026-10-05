import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/server/products";
import { safeLogError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }> | { slug: string };
}

/**
 * GET /api/products/[slug]
 * Lấy thông tin chi tiết một sản phẩm theo đường dẫn định danh (slug)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Tương thích cả params dạng Promise (Next.js 15+) và Plain Object (Next.js 14)
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_QUERY",
            message: "Slug sản phẩm không hợp lệ",
          },
        },
        { status: 400 }
      );
    }

    // Truy vấn dữ liệu chi tiết
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Không tìm thấy sản phẩm có slug '${slug}'`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: product,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    safeLogError("API GET /api/products/[slug] error", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: "Đã có lỗi xảy ra phía máy chủ khi xử lý yêu cầu",
        },
      },
      { status: 500 }
    );
  }
}
