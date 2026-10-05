import "server-only";
import { cache } from "react";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * ProductDTO dành riêng cho UI hiển thị danh sách
 * Bảo mật: Chỉ chứa các trường cần thiết, ngày tháng chuẩn ISO 8601, tiền tệ nguyên VNĐ.
 */
export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  price: number; // Tiền nguyên VNĐ (định dạng ở UI bằng Intl.NumberFormat)
  originalPrice: number | null;
  stock: number;
  image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string; // Chuỗi ISO
}

/**
 * ProductDetailDTO dành cho trang chi tiết /products/[slug]
 */
export interface ProductDetailDTO extends ProductDTO {
  description: string | null;
  specs: Record<string, string> | null;
  updatedAt: string; // Chuỗi ISO
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  sort?: "popular" | "price_asc" | "price_desc" | "newest";
}

export interface ListProductsResult {
  products: ProductDTO[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/**
 * 1. listProducts(filters)
 * Truy vấn danh sách sản phẩm theo bộ lọc (Không N+1: đúng 1 query đếm + 1 query lấy danh sách)
 */
export async function listProducts(
  filters: ProductFilters = {}
): Promise<ListProductsResult> {
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 12));
  const { q, category, sort } = filters;

  // Điều kiện lọc
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (q && q.trim()) {
    const keyword = q.trim();
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = {
      OR: [{ slug: category }, { id: category }],
    };
  }

  // Điều kiện sắp xếp
  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "popular":
      orderBy = { orderItems: { _count: "desc" } };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  // BẢO MẬT & HIỆU NĂNG: Đúng 2 truy vấn song song (1 count + 1 findMany)
  // Chỉ select các cột cần thiết (không lấy trường description dài)
  const [total, records] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        stock: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
    }),
  ]);

  // Ánh xạ sang ProductDTO chuẩn cho UI (chuyển Date sang ISO string)
  const products: ProductDTO[] = records.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    originalPrice: item.originalPrice,
    stock: item.stock,
    image: item.image,
    category: item.category,
    createdAt: item.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    products,
    total,
    totalPages,
    page,
    pageSize,
  };
}

/**
 * 2. getProductBySlug(slug)
 * Lấy chi tiết sản phẩm theo slug
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetailDTO | null> {
  if (!slug || typeof slug !== "string") return null;

  const product = await prisma.product.findUnique({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      stock: true,
      image: true,
      description: true,
      specs: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    image: product.image,
    category: product.category,
    description: product.description,
    specs: (product.specs as Record<string, string>) || null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * 3. getRelatedProducts(product, limit)
 * Lấy danh sách sản phẩm cùng danh mục liên quan (ngoại trừ chính sản phẩm đang xem)
 */
export async function getRelatedProducts(
  product: { id: string; categoryId?: string; category?: { id: string } },
  limit: number = 4
): Promise<ProductDTO[]> {
  const catId = product.categoryId || product.category?.id;
  if (!catId) return [];

  const records = await prisma.product.findMany({
    where: {
      categoryId: catId,
      NOT: { id: product.id },
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      stock: true,
      image: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdAt: true,
    },
  });

  return records.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    originalPrice: item.originalPrice,
    stock: item.stock,
    image: item.image,
    category: item.category,
    createdAt: item.createdAt.toISOString(),
  }));
}

export const getProducts = listProducts;

/**
 * 4. getAdminProducts(params)
 * Truy vấn danh sách quản trị sản phẩm có phân trang và chỉ select các cột hiển thị bảng,
 * loại bỏ các trường nặng (specs, description) để tránh nghẽn RAM và overfetching.
 */
export async function getAdminProducts(params: { page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));

  const [total, records] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    }),
  ]);

  return {
    products: records,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    page,
    pageSize,
  };
}

/**
 * Lấy danh sách danh mục để phục vụ bộ lọc trên UI (Được cache bằng React.cache)
 */
export const getCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
});
