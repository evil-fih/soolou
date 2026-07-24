import { Heart, Plus } from "@phosphor-icons/react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import type { Product } from "../data/products";
import { ProductModel } from "./ProductModel";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showBadge?: boolean;
  badgeOverride?: string;
}

export function ProductCard({ product, compact = false, showBadge = false, badgeOverride }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(product.id);

  return (
    <article className={compact ? "product-card product-card-compact" : "product-card"}>
      <a
        className="product-card-media"
        href={`#/product/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        {showBadge && (badgeOverride || product.badge === "New" || product.badge === "Limited")
          ? <span className="product-badge">{badgeOverride ?? product.badge}</span>
          : null}
        <ProductModel product={product} size={compact ? "compact" : "card"} />
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
            <button
              className={saved ? "icon-button product-card-favorite-active" : "icon-button"}
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-label={saved ? `Remove ${product.name} from favorites` : `Save ${product.name}`}
              aria-pressed={saved}
            >
              <Heart weight={saved ? "fill" : "bold"} />
            </button>
            <button
              className="icon-button icon-button-filled"
              type="button"
              onClick={() => addItem(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
