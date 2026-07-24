import type { Product } from "../data/products";
import { DollPreview } from "./DollPreview";

interface ProductModelProps {
  product: Product;
  size?: "card" | "compact" | "large" | "thumb";
}

const softWearableSlugs = new Set([
  "white-comfy-shorts",
  "daisy-hair-clips",
  "cream-cozy-scarf",
  "white-ruffle-skirt",
  "white-soft-tee",
  "pink-sleeveless-top",
  "white-short-sleeve-tee",
  "cream-collar-shirt",
  "cream-pleated-skirt",
  "cream-lace-hem-skirt",
  "cream-pocket-pinafore",
  "cream-soft-cardigan",
  "cream-denim-shorts",
]);

export function ProductModel({ product, size = "card" }: ProductModelProps) {
  if (!product.image) {
    return (
      <DollPreview
        look={product.look}
        label={product.name}
        size={size === "large" ? "lg" : size === "thumb" || size === "compact" ? "sm" : "md"}
        floating={size === "large"}
      />
    );
  }

  const usesSoftWearable = softWearableSlugs.has(product.slug);
  const itemImage = usesSoftWearable ? `/products/wearable/${product.slug}.png` : product.image;
  const itemClassName = usesSoftWearable ? "product-model-item product-model-item-soft" : "product-model-item";

  return (
    <span className={`product-model product-model-${size}`} role="img" aria-label={product.name}>
      <img className="product-model-base" src="/products/base-doll.png" alt="" aria-hidden="true" />
      <img className={itemClassName} src={itemImage} alt="" aria-hidden="true" />
    </span>
  );
}
