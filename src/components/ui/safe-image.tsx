"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

/**
 * Fallback SVG Data-URI chất lượng cao, nhẹ và độc lập.
 * Hiển thị khung ảnh trung tính kèm thông điệp khi ảnh gốc bị thiếu hoặc lỗi 404.
 */
export const DEFAULT_FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none">
      <rect width="400" height="300" fill="#f8fafc"/>
      <g opacity="0.35" transform="translate(160, 105)">
        <rect x="0" y="0" width="80" height="60" rx="8" stroke="#475569" stroke-width="4" fill="none"/>
        <circle cx="26" cy="22" r="7" fill="#475569"/>
        <path d="M8 52 L32 30 L52 44 L66 34 L72 52 Z" fill="#475569"/>
      </g>
      <text x="50%" y="200" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">
        Ảnh đang cập nhật
      </text>
    </svg>
  `.trim());

export interface SafeImageProps extends Omit<ImageProps, "alt"> {
  /**
   * Thẻ alt bắt buộc để đảm bảo ngữ nghĩa và SEO.
   */
  alt: string;
  /**
   * Đường dẫn ảnh thay thế khi ảnh chính bị hỏng hoặc rỗng.
   */
  fallbackSrc?: string;
}

/**
 * Component SafeImage:
 * - Tối ưu hóa tự động qua Next.js Image Optimization.
 * - Xử lý fallback mượt mà khi ảnh lỗi mà không làm vỡ giao diện.
 * - Khắc phục hiện tượng CLS (Cumulative Layout Shift) bằng kích thước/aspect-ratio xác định.
 * - Hỗ trợ cờ priority cho phần tử LCP.
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  className,
  style,
  onError,
  priority = false,
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Nếu không có src hoặc src rỗng -> dùng fallback ngay lập tức
  const isInvalidSrc = !src || (typeof src === "string" && src.trim() === "");
  const currentSrc = hasError || isInvalidSrc ? fallbackSrc : src;
  const isFallback = hasError || isInvalidSrc;

  const safeAlt = alt && alt.trim().length > 0 ? alt : "Hình ảnh sản phẩm";

  return (
    <Image
      src={currentSrc}
      alt={safeAlt}
      className={className}
      style={style}
      priority={priority}
      unoptimized={isFallback} // Tắt bộ tối ưu nếu đang dùng fallback data-URI
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
        }
        if (onError) {
          onError(e);
        }
      }}
      {...rest}
    />
  );
}
