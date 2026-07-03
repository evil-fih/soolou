import { Heart, ShoppingBag } from "@phosphor-icons/react";
import type { Product } from "../data/products";
import { DollPreview } from "./DollPreview";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  return (
    <article className={compact ? "product-card product-card-compact" : "product-card"}>
      <a className="product-card-media" href={`#/product/${product.slug}`}>
        <span className="product-badge">{product.badge}</span>
        <DollPreview look={product.look} label={product.name} size={compact ? "sm" : "md"} />
      </a>
      <div className="product-card-body">
        <div>
          <a className="product-title" href={`#/product/${product.slug}`}>
            {product.name}
          </a>
          <p>{product.description}</p>
        </div>
        <div className="product-card-bottom">
          <strong>${product.price}</strong>
          <div className="product-card-actions">
            <a className="icon-button" href="#/shop" aria-label={`Save ${product.name}`}>
              <Heart weight="bold" />
            </a>
            <a className="icon-button icon-button-filled" href="#/cart" aria-label={`Add ${product.name} to cart`}>
              <ShoppingBag weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
