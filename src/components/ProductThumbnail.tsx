import type { Product } from "../data/products";

interface ProductThumbnailProps {
  product: Product;
  size?: "sm" | "md";
}

export function ProductThumbnail({ product, size = "md" }: ProductThumbnailProps) {
  const image = product.image ?? "/base-doll-nobg.png";

  return (
    <span className={`product-thumbnail product-thumbnail-${size}`} role="img" aria-label={product.name}>
      <img src={image} alt="" aria-hidden="true" />
    </span>
  );
}
