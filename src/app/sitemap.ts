import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // Làm mới sitemap mỗi 1 giờ

/**
 * Next.js Metadata Route: sitemap.xml
 * - Chỉ lập chỉ mục các trang công khai và sản phẩm đang bán (isActive: true).
 * - Tuyệt đối không đưa trang quản trị (/admin) hay dữ liệu riêng tư vào sitemap.
 * - Giới hạn an toàn tối đa 50.000 URLs theo chuẩn giao thức sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://mini-shop-q7ejctkn4-k0978.vercel.app"
  ).replace(/\/$/, "");

  // 1. Các trang tĩnh công khai cố định
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Lấy danh sách sản phẩm ĐANG BÁN (isActive: true)
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50000,
    });

    const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
      url: `${baseUrl}/products/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("[Sitemap Error]", error);
    return staticRoutes;
  }
}

