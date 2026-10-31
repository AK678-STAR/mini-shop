import React from "react";
import Link from "next/link";
import { ProductDTO } from "@/server/products";
import { SafeImage } from "@/components/ui/safe-image";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductDTO;
  priority?: boolean;
}) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  const formattedOriginal = product.originalPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.originalPrice)
    : null;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article className="product-card" data-component="ProductCard">
      <Link
        href={`/products/${product.slug}`}
        className="product-card-img-wrap"
        aria-label={`Xem chi tiết sản phẩm ${product.name}`}
        style={{ textDecoration: "none", display: "block", position: "relative" }}
      >
        <SafeImage
          src={product.image || ""}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="product-card-img"
          priority={priority}
        />
        {discountPercent && (
          <span className="card-badge badge-sale">-{discountPercent}%</span>
        )}
      </Link>

      <div className="card-body">
        <span className="card-category">{product.category.name}</span>
        <h3 className="card-title">
          <Link href={`/products/${product.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>

        <div className="card-footer">
          <div className="card-price">
            <span className="price-current">{formattedPrice}</span>
            {formattedOriginal && (
              <span className="price-original">{formattedOriginal}</span>
            )}
          </div>
          <button
            type="button"
            className="btn-add-cart"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            title="Thêm vào giỏ hàng"
            style={{
              minWidth: "48px",
              minHeight: "48px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface-secondary)",
              cursor: "pointer",
            }}
          >
            🛒
          </button>
        </div>
      </div>
    </article>
  );
}
