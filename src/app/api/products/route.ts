import { NextRequest, NextResponse } from "next/server";
import { parseProductQuery } from "@/lib/validators/product-query";
import { getProducts } from "@/server/products";
import { safeLogError } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Danh sách sản phẩm phân trang, tìm kiếm, lọc danh mục và sắp xếp
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Parse và Validate Query Parameters bằng Zod
    const queryValidation = parseProductQuery(searchParams);

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_QUERY",
            message: "Tham số truy vấn không hợp lệ",
            details: queryValidation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // 2. Thực thi truy vấn sản phẩm qua Service Layer
    const result = await getProducts(queryValidation.data);

    // 3. Trả về kết quả thành công theo hợp đồng API
    return NextResponse.json(
      {
        data: result.products,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    // Không lộ stack trace hoặc cấu trúc SQL ra bên ngoài
    safeLogError("API GET /api/products error", error);
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

import { authorize } from "@/server/guards";
import { Role } from "@prisma/client";

/**
 * POST /api/products
 * Yêu cầu đăng nhập và phân quyền ADMIN
 */
export async function POST(request: NextRequest) {
  // DÒNG ĐẦU TIÊN: Kiểm tra phân quyền ADMIN qua guards
  const authResult = await authorize(Role.ADMIN);
  if (!authResult.ok) {
    const status = authResult.code === "UNAUTHENTICATED" ? 401 : 403;
    return NextResponse.json(
      {
        error: {
          code: authResult.code,
          message: authResult.message,
        },
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Chức năng tạo sản phẩm qua API đang được phát triển.",
      },
    },
    { status: 501 }
  );
}
