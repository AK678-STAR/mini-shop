import type { MetadataRoute } from "next";

/**
 * Next.js Metadata Route: robots.txt
 * - Chặn bot tìm kiếm truy cập các khu vực quản trị, api và dữ liệu người dùng cá nhân.
 * - Chỉ định vị trí của sitemap.xml tự động qua biến môi trường NEXT_PUBLIC_SITE_URL.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mini-shop-q7ejctkn4-k0978.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cart", "/account/"],
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}

