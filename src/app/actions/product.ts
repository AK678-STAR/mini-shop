"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  ProductSchema,
  ProductIdSchema,
  ActionResponse,
} from "@/lib/validators/product";
import { safeLogError } from "@/lib/logger";
import { Prisma, Role } from "@prisma/client";
import { authorize } from "@/server/guards";

/**
 * Trích xuất FormData hoặc Object thành Record an toàn (loại bỏ any)
 */
function extractFormData(
  rawInput: FormData | Record<string, unknown>
): Record<string, unknown> {
  if (rawInput instanceof FormData) {
    const data: Record<string, unknown> = {};
    rawInput.forEach((value, key) => {
      // Bỏ qua các trường ẩn của Next.js hoặc rỗng
      if (key.startsWith("$ACTION_")) return;
      data[key] = value;
    });
    return data;
  }
  return rawInput;
}

/**
 * 1. TẠO MỚI SẢN PHẨM (createProduct)
 */
export async function createProduct(
  prevState: ActionResponse | null,
  formData: FormData | Record<string, unknown>
): Promise<ActionResponse> {
  // Dòng đầu tiên: Kiểm tra phân quyền ADMIN qua guards
  const auth = await authorize(Role.ADMIN);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  try {
    const rawData = extractFormData(formData);

    // Validate chặt chẽ phía Server bằng Zod (Zero-trust)
    const parseResult = ProductSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        fieldErrors: parseResult.error.flatten().fieldErrors,
        message: "Thông tin sản phẩm chưa hợp lệ. Vui lòng kiểm tra lại các trường báo lỗi.",
      };
    }

    const { name, slug, price, originalPrice, stock, categoryId, description, image, isActive } =
      parseResult.data;

    // 1. Kiểm tra danh mục có tồn tại trong cơ sở dữ liệu không
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return {
        ok: false,
        code: "NOT_FOUND",
        fieldErrors: {
          categoryId: ["Danh mục được chọn không tồn tại trên hệ thống."],
        },
        message: "Danh mục sản phẩm không tồn tại. Vui lòng chọn danh mục khác.",
      };
    }

    // 2. Kiểm tra slug đã tồn tại chưa
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      return {
        ok: false,
        code: "DUPLICATE_SLUG",
        fieldErrors: {
          slug: ["Đường dẫn định danh (slug) này đã được sử dụng. Vui lòng chọn slug khác."],
        },
        message: "Đường dẫn định danh (slug) đã tồn tại trong hệ thống.",
      };
    }

    // 3. Tạo sản phẩm - Chỉ nhận các trường trong whitelist, không nhận trường ngoài
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        price,
        originalPrice: originalPrice ?? null,
        stock,
        categoryId,
        description: description ?? null,
        image: image || null,
        isActive: isActive ?? true,
      },
    });

    // Làm mới cache các trang danh sách sản phẩm
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      ok: true,
      message: "Thêm mới sản phẩm thành công!",
      data: { id: newProduct.id, slug: newProduct.slug },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        code: "DUPLICATE_SLUG",
        fieldErrors: {
          slug: ["Đường dẫn định danh (slug) đã bị trùng lặp."],
        },
        message: "Đường dẫn định danh (slug) này đã tồn tại trong cơ sở dữ liệu.",
      };
    }

    // Log bảo mật: Không làm rò rỉ credential DB
    safeLogError("Lỗi khi thêm mới sản phẩm", error);
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Hệ thống gặp sự cố khi xử lý dữ liệu. Vui lòng thử lại sau giây lát.",
    };
  }
}

/**
 * 2. CẬP NHẬT SẢN PHẨM (updateProduct)
 */
export async function updateProduct(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData | Record<string, unknown>
): Promise<ActionResponse> {
  // Dòng đầu tiên: Kiểm tra phân quyền ADMIN qua guards
  const auth = await authorize(Role.ADMIN);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  // Validate ID bằng Zod
  const idValidation = ProductIdSchema.safeParse(id);
  if (!idValidation.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Mã định danh sản phẩm không hợp lệ.",
    };
  }

  try {
    const validId = idValidation.data;

    // 1. Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await prisma.product.findUnique({
      where: { id: validId },
      select: { id: true, slug: true },
    });
    if (!existingProduct) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Không tìm thấy sản phẩm cần cập nhật trong hệ thống.",
      };
    }

    const rawData = extractFormData(formData);

    // Validate lại tại Server
    const parseResult = ProductSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        fieldErrors: parseResult.error.flatten().fieldErrors,
        message: "Thông tin cập nhật chưa hợp lệ. Vui lòng kiểm tra lại.",
      };
    }

    const { name, slug, price, originalPrice, stock, categoryId, description, image, isActive } =
      parseResult.data;

    // 2. Kiểm tra danh mục
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return {
        ok: false,
        code: "NOT_FOUND",
        fieldErrors: {
          categoryId: ["Danh mục được chọn không tồn tại."],
        },
        message: "Danh mục sản phẩm không tồn tại.",
      };
    }

    // 3. Nếu slug bị đổi, kiểm tra xem có trùng với sản phẩm KHÁC không
    if (slug !== existingProduct.slug) {
      const slugConflict = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: validId },
        },
        select: { id: true },
      });
      if (slugConflict) {
        return {
          ok: false,
          code: "DUPLICATE_SLUG",
          fieldErrors: {
            slug: ["Slug này đã được sử dụng bởi một sản phẩm khác."],
          },
          message: "Đường dẫn định danh (slug) đã tồn tại ở sản phẩm khác.",
        };
      }
    }

    // 4. Cập nhật vào DB
    const updated = await prisma.product.update({
      where: { id: validId },
      data: {
        name,
        slug,
        price,
        originalPrice: originalPrice ?? null,
        stock,
        categoryId,
        description: description ?? null,
        image: image || null,
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      ok: true,
      message: "Cập nhật sản phẩm thành công!",
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        code: "DUPLICATE_SLUG",
        fieldErrors: {
          slug: ["Slug đã được sử dụng bởi sản phẩm khác."],
        },
        message: "Đường dẫn định danh (slug) này đã bị trùng lặp.",
      };
    }

    safeLogError("Lỗi khi cập nhật sản phẩm", error);
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Hệ thống gặp sự cố khi cập nhật sản phẩm. Vui lòng thử lại sau.",
    };
  }
}

/**
 * 3. XOÁ SẢN PHẨM (deleteProduct)
 * Ràng buộc: Sản phẩm đã nằm trong đơn hàng thì KHÔNG xoá cứng, trả lỗi IN_USE với gợi ý "ngừng bán".
 */
export async function deleteProduct(id: string): Promise<ActionResponse> {
  // Dòng đầu tiên: Kiểm tra phân quyền ADMIN qua guards
  const auth = await authorize(Role.ADMIN);
  if (!auth.ok) {
    return {
      ok: false,
      code: auth.code,
      message: auth.message,
    };
  }

  // Validate ID bằng Zod
  const idValidation = ProductIdSchema.safeParse(id);
  if (!idValidation.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Mã sản phẩm không hợp lệ.",
    };
  }

  try {
    const validId = idValidation.data;

    // 1. Kiểm tra sự tồn tại và số lượng đơn hàng liên quan
    const product = await prisma.product.findUnique({
      where: { id: validId },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Không tìm thấy sản phẩm cần xoá trong hệ thống.",
      };
    }

    // 2. Kiểm tra ràng buộc nghiệp vụ: Đã có đơn hàng liên quan
    if (product._count.orderItems > 0) {
      return {
        ok: false,
        code: "IN_USE",
        message: `Sản phẩm này đã phát sinh trong ${product._count.orderItems} đơn hàng của khách hàng nên không thể xoá vĩnh viễn. Gợi ý: Bạn hãy chuyển trạng thái sản phẩm sang "Ngừng kinh doanh" (Ẩn khỏi gian hàng) để đảm bảo toàn vẹn dữ liệu đơn hàng.`,
      };
    }

    // 3. Nếu chưa từng phát sinh đơn hàng -> Cho phép xoá cứng
    await prisma.product.delete({
      where: { id: validId },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      ok: true,
      message: "Đã xoá sản phẩm thành công khỏi hệ thống!",
    };
  } catch (error) {
    safeLogError("Lỗi khi xoá sản phẩm", error);
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Hệ thống gặp sự cố khi xoá sản phẩm. Vui lòng thử lại sau.",
    };
  }
}
