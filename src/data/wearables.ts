import type { Product } from "./products";

export const wearableSlugs = [
  "black-bell-sleeve-top",
  "black-comfy-shorts",
  "black-pleated-skirt",
  "black-short-sleeve-tee",
  "black-sleeveless-top",
  "black-stitch-hem-top",
  "blue-cozy-scarf",
  "blue-denim-shorts",
  "blue-flower-dress",
  "blue-mini-tie",
  "blue-studio-blazer",
  "cocoa-beret",
  "cocoa-button-vest",
  "cocoa-patch-shorts",
  "cocoa-soft-cardigan",
  "cream-collar-shirt",
  "cream-cozy-scarf",
  "cream-denim-shorts",
  "cream-lace-hem-skirt",
  "cream-pleated-skirt",
  "cream-pocket-pinafore",
  "cream-soft-cardigan",
  "daisy-hair-clips",
  "moss-patch-shorts",
  "navy-button-vest",
  "olive-long-coat",
  "pink-sleeveless-top",
  "pink-bow-blouse",
  "pink-puff-sleeves",
  "rust-collar-shirt",
  "rust-cozy-scarf",
  "rust-mini-tie",
  "rust-plaid-shorts",
  "rust-pleated-skirt",
  "sunny-button-coat",
  "striped-cocoa-tie",
  "taupe-collar-shirt",
  "white-comfy-shorts",
  "white-ruffle-skirt",
  "white-short-sleeve-tee",
  "white-soft-tee",
  "yellow-scallop-dress",
];

export function getWearableProducts(products: Product[]) {
  return products.filter((product) => wearableSlugs.includes(product.slug));
}

export const hairOptions = [
  {
    slug: "midnight-tousle-hair",
    name: "Midnight Tousle",
    image: "/products/midnight-tousle-hair.jpg",
    wearable: "/products/wearable/midnight-tousle-hair.png",
  },
  {
    slug: "plum-bob-hair",
    name: "Plum Bob",
    image: "/products/plum-bob-hair.png",
    wearable: "/products/wearable/plum-bob-hair.png",
  },
  {
    slug: "honey-centerpart-hair",
    name: "Honey Centerpart",
    image: "/products/honey-centerpart-hair.png",
    wearable: "/products/wearable/honey-centerpart-hair.png",
  },
  {
    slug: "plum-centerpart-hair",
    name: "Plum Centerpart",
    image: "/products/plum-centerpart-hair.jpg",
    wearable: "/products/wearable/plum-centerpart-hair.png",
  },
];

export const slotGroups: Record<string, string[]> = {
  top: [
    "black-bell-sleeve-top",
    "black-short-sleeve-tee",
    "black-sleeveless-top",
    "black-stitch-hem-top",
    "blue-studio-blazer",
    "cocoa-button-vest",
    "cocoa-soft-cardigan",
    "cream-collar-shirt",
    "cream-soft-cardigan",
    "navy-button-vest",
    "olive-long-coat",
    "pink-bow-blouse",
    "pink-puff-sleeves",
    "pink-sleeveless-top",
    "rust-collar-shirt",
    "sunny-button-coat",
    "taupe-collar-shirt",
    "white-short-sleeve-tee",
    "white-soft-tee",
  ],
  bottom: [
    "black-comfy-shorts",
    "black-pleated-skirt",
    "blue-denim-shorts",
    "cocoa-patch-shorts",
    "cream-denim-shorts",
    "cream-lace-hem-skirt",
    "cream-pleated-skirt",
    "moss-patch-shorts",
    "rust-plaid-shorts",
    "rust-pleated-skirt",
    "white-comfy-shorts",
    "white-ruffle-skirt",
  ],
  dress: ["blue-flower-dress", "cream-pocket-pinafore", "yellow-scallop-dress"],
  scarf: ["blue-cozy-scarf", "cream-cozy-scarf", "rust-cozy-scarf"],
  tie: ["blue-mini-tie", "rust-mini-tie", "striped-cocoa-tie"],
  hat: ["cocoa-beret"],
  clip: ["daisy-hair-clips"],
  hair: hairOptions.map((h) => h.slug),
};

export function getSlot(slug: string): string | null {
  for (const [slot, slugs] of Object.entries(slotGroups)) {
    if (slugs.includes(slug)) return slot;
  }
  return null;
}
