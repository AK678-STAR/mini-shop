import React from "react";
import Link from "next/link";
import { ProductDTO } from "@/server/products";

export function ProductCard({ product }: { product: ProductDTO }) {
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
      <Link href={`/products/${product.slug}`} className="card-media" style={{ textDecoration: "none" }}>
        <img
          src={product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop"}
          alt={product.name}
          className="card-img"
          loading="lazy"
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
            aria-label={`Thêm ${product.name} vào giỏ`}
            title="Thêm vào giỏ hàng"
          >
            🛒
          </button>
        </div>
      </div>
    </article>
  );
}
