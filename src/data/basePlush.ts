import type { Product } from "./products";

export const basePlushProduct: Product = {
  id: 9001,
  slug: "custom-base-plush",
  name: "Base Plush",
  category: "limited",
  price: 52,
  badge: "Base",
  description: "The soft Soolou plush base without clothing or accessories.",
  detail: "A plain Soolou base plush ready to dress your way.",
  tags: ["No clothing", "Base plush", "Ready to dress"],
  palette: "#f5dcb8",
  image: "/base-doll-nobg.png",
  look: {
    body: "#f5dcb8",
    belly: "#fff3df",
    hair: "#2c2230",
    outfit: "#f5dcb8",
    accent: "#e375ad",
    expression: "smile",
  },
};

export function normalizeBasePlushProduct(product: Product): Product {
  if (product.id === basePlushProduct.id || product.slug === basePlushProduct.slug) {
    return basePlushProduct;
  }

  return product;
}
