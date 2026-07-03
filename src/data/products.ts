export type ProductCategory = "clothes" | "hair" | "accessories" | "limited";
export type DollExpression = "smile" | "button" | "sleepy" | "spark";

export interface DollLook {
  body: string;
  belly: string;
  hair: string;
  outfit: string;
  accent: string;
  expression: DollExpression;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  badge: string;
  description: string;
  detail: string;
  tags: string[];
  palette: string;
  look: DollLook;
}

export const categories: Array<{
  id: ProductCategory;
  label: string;
  description: string;
}> = [
  {
    id: "clothes",
    label: "Clothes",
    description: "Tiny hoodies, dresses, tees, and seasonal sets.",
  },
  {
    id: "hair",
    label: "Hair",
    description: "Soft yarn hairstyles, bows, bangs, and little curls.",
  },
  {
    id: "accessories",
    label: "Accessories",
    description: "Bags, charms, embroidered names, and gift notes.",
  },
  {
    id: "limited",
    label: "Limited",
    description: "Small-batch plush drops with special fabrics.",
  },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "berry-button-buddy",
    name: "Berry Button Buddy",
    category: "limited",
    price: 38,
    badge: "New",
    description: "A round plush friend with berry cheeks and stitched button eyes.",
    detail: "Hand finished in a soft fleece blend with a removable ribbon cape.",
    tags: ["Gift box", "Name stitch", "Small batch"],
    palette: "#f45d97",
    look: {
      body: "#f7d6e7",
      belly: "#fff4ee",
      hair: "#7b4a85",
      outfit: "#ff8fba",
      accent: "#ff5da2",
      expression: "button",
    },
  },
  {
    id: 2,
    slug: "cloud-pajama-set",
    name: "Cloud Pajama Set",
    category: "clothes",
    price: 22,
    badge: "Fresh",
    description: "Cozy sky-blue pajamas for Soolou plushies and bedtime gifts.",
    detail: "Includes a soft top, matching shorts, and a tiny sleepy cap.",
    tags: ["Outfit", "Washable", "Soft cotton"],
    palette: "#7dc7ed",
    look: {
      body: "#f9d8c9",
      belly: "#fff6ef",
      hair: "#63473c",
      outfit: "#7dc7ed",
      accent: "#ffffff",
      expression: "sleepy",
    },
  },
  {
    id: 3,
    slug: "sunny-yarn-bangs",
    name: "Sunny Yarn Bangs",
    category: "hair",
    price: 16,
    badge: "New",
    description: "A bright yarn hair kit with soft fringe and two tiny clips.",
    detail: "Made for mix-and-match plush styling with gentle snap fasteners.",
    tags: ["Hair kit", "Clips", "Mixable"],
    palette: "#f5bd45",
    look: {
      body: "#f2c9a7",
      belly: "#fff4e8",
      hair: "#e7a93a",
      outfit: "#99d5ef",
      accent: "#f5bd45",
      expression: "spark",
    },
  },
  {
    id: 4,
    slug: "picnic-overall-doll",
    name: "Picnic Overall Doll",
    category: "limited",
    price: 44,
    badge: "Limited",
    description: "A ready-made plush with gingham overalls and embroidered initials.",
    detail: "A cheerful keepsake doll finished with a custom name patch.",
    tags: ["Custom patch", "Gift wrap", "Ready doll"],
    palette: "#79b94e",
    look: {
      body: "#f4d6bc",
      belly: "#fff3e7",
      hair: "#2d2b35",
      outfit: "#79b94e",
      accent: "#ff6aa5",
      expression: "smile",
    },
  },
  {
    id: 5,
    slug: "heart-pocket-tee",
    name: "Heart Pocket Tee",
    category: "clothes",
    price: 18,
    badge: "New",
    description: "A plush-size tee with a tiny pocket for notes or charms.",
    detail: "Pairs with every standard Soolou doll and ships in a paper sleeve.",
    tags: ["Outfit", "Tiny pocket", "Everyday"],
    palette: "#ff7aa8",
    look: {
      body: "#edc3aa",
      belly: "#fff3ea",
      hair: "#45362f",
      outfit: "#fff5f7",
      accent: "#ff7aa8",
      expression: "smile",
    },
  },
  {
    id: 6,
    slug: "moon-bow-charm",
    name: "Moon Bow Charm",
    category: "accessories",
    price: 12,
    badge: "Fresh",
    description: "A plush charm with a bow, moon bead, and tiny keepsake tag.",
    detail: "Clip it to a doll, gift bag, backpack, or nursery shelf loop.",
    tags: ["Charm", "Keepsake", "Gift add-on"],
    palette: "#9b8cf0",
    look: {
      body: "#d8d2ff",
      belly: "#fff4ee",
      hair: "#4c427a",
      outfit: "#c8bdff",
      accent: "#ff73ad",
      expression: "spark",
    },
  },
  {
    id: 7,
    slug: "cocoa-curl-kit",
    name: "Cocoa Curl Kit",
    category: "hair",
    price: 19,
    badge: "New",
    description: "A textured yarn curl set with a plush-safe styling comb.",
    detail: "Designed for gentle styling with looped yarn and secure stitching.",
    tags: ["Hair kit", "Comb", "Textured yarn"],
    palette: "#8a5a44",
    look: {
      body: "#c69278",
      belly: "#fff1e5",
      hair: "#3d231a",
      outfit: "#90caec",
      accent: "#ff6aa5",
      expression: "button",
    },
  },
  {
    id: 8,
    slug: "starlight-gift-doll",
    name: "Starlight Gift Doll",
    category: "limited",
    price: 48,
    badge: "Limited",
    description: "A premium gift doll with a star cape and a hand-written note card.",
    detail: "Prepared as a keepsake gift with embroidery, tissue wrap, and care card.",
    tags: ["Gift ready", "Embroidery", "Keepsake"],
    palette: "#4aa9df",
    look: {
      body: "#f0cbb5",
      belly: "#fff2e8",
      hair: "#533b6d",
      outfit: "#4aa9df",
      accent: "#ffd464",
      expression: "spark",
    },
  },
];

export const featuredProduct = products[0];

export function findProduct(slug: string | undefined) {
  return products.find((product) => product.slug === slug) ?? featuredProduct;
}
