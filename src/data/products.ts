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
  extraCategories?: ProductCategory[];
  image?: string;
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

const fallbackLook: DollLook = {
  body: "#f9d8c9",
  belly: "#fff6ef",
  hair: "#4c3f4e",
  outfit: "#7dc7ed",
  accent: "#ff78ae",
  expression: "smile",
};

function product(
  id: number,
  slug: string,
  name: string,
  category: ProductCategory,
  price: number,
  badge: string,
  description: string,
  image: string,
  tags: string[],
  palette: string,
  extraCategories: ProductCategory[] = [],
): Product {
  return {
    id,
    slug,
    name,
    category,
    price,
    badge,
    description,
    detail: "Hand-drawn Soolou piece made for mix-and-match plush styling.",
    tags,
    palette,
    extraCategories,
    image: `/products/${image}`,
    look: {
      ...fallbackLook,
      outfit: palette,
      accent: palette,
      hair: category === "hair" ? palette : fallbackLook.hair,
      expression: category === "accessories" ? "spark" : "smile",
    },
  };
}

export const products: Product[] = [
  product(1, "blue-denim-shorts", "Blue Denim Shorts", "clothes", 16, "New", "A soft blue shorts piece with a tiny waistband and stitched pocket details.", "blue-denim-shorts.jpg", ["Shorts", "Blue", "Mixable"], "#5b86ac"),
  product(2, "cocoa-patch-shorts", "Cocoa Patch Shorts", "clothes", 16, "New", "Dark cocoa shorts with sketched patch texture for cozy everyday styling.", "cocoa-patch-shorts.jpg", ["Shorts", "Cocoa", "Textured"], "#2d1e19"),
  product(3, "midnight-tousle-hair", "Midnight Tousle Hair", "hair", 18, "New", "A playful dark tousled hair piece with soft sketchy edges.", "midnight-tousle-hair.jpg", ["Hair", "Tousled", "Dark"], "#343340"),
  product(4, "plum-bob-hair", "Plum Bob Hair", "hair", 18, "Fresh", "A rounded plum bob hairstyle with neat bangs and sweet side pieces.", "plum-bob-hair.png", ["Hair", "Bob", "Plum"], "#2c2230"),
  product(5, "honey-centerpart-hair", "Honey Centerpart Hair", "hair", 18, "Limited", "A honey brown center-part hairstyle for a gentle classic plush look.", "honey-centerpart-hair.png", ["Hair", "Honey", "Classic"], "#7b623d", ["limited"]),
  product(6, "white-comfy-shorts", "White Comfy Shorts", "clothes", 16, "Fresh", "Clean white shorts with soft gray stitching and a relaxed plush fit.", "white-comfy-shorts.jpg", ["Shorts", "White", "Soft"], "#f7f4ee"),
  product(7, "cream-denim-shorts", "Cream Denim Shorts", "clothes", 16, "Fresh", "Cream denim-style shorts with a warm waistband and easy pairing color.", "cream-denim-shorts.jpg", ["Shorts", "Cream", "Denim"], "#fff8e8"),
  product(8, "moss-patch-shorts", "Moss Patch Shorts", "clothes", 16, "New", "Moss green shorts with soft shaded patches and stitched charm.", "moss-patch-shorts.jpg", ["Shorts", "Moss", "Patch"], "#3f4b36"),
  product(9, "daisy-hair-clips", "Daisy Hair Clips", "accessories", 10, "Tiny", "Two small daisy clips for adding a bright little flower moment.", "daisy-hair-clips.jpg", ["Clips", "Daisy", "Gift add-on"], "#fff8dd"),
  product(10, "cocoa-beret", "Cocoa Beret", "accessories", 18, "New", "A soft cocoa beret sitting snugly on top for a cozy, artsy plush look.", "cocoa-swoop-hair.jpg", ["Beret", "Cocoa", "Hat"], "#3d2d22"),
  product(11, "blue-cozy-scarf", "Blue Cozy Scarf", "accessories", 12, "Fresh", "A small blue scarf made for layered winter plush outfits.", "blue-cozy-scarf.jpg", ["Scarf", "Blue", "Cozy"], "#4f70ad"),
  product(12, "rust-cozy-scarf", "Rust Cozy Scarf", "accessories", 12, "Fresh", "A warm rust scarf for autumn gifts and soft outfit styling.", "rust-cozy-scarf.jpg", ["Scarf", "Rust", "Cozy"], "#a94732"),
  product(13, "cream-cozy-scarf", "Cream Cozy Scarf", "accessories", 12, "Fresh", "A cream scarf that keeps plush outfits soft and gift-ready.", "cream-cozy-scarf.jpg", ["Scarf", "Cream", "Soft"], "#fff8e8"),
  product(14, "plum-centerpart-hair", "Plum Centerpart Hair", "hair", 18, "Fresh", "A deep plum center-part hairstyle with a smooth rounded shape.", "plum-centerpart-hair.jpg", ["Hair", "Plum", "Center part"], "#2d2232"),
  product(15, "blue-studio-blazer", "Blue Studio Blazer", "clothes", 24, "Fresh", "A tiny blue blazer with long sleeves and statement cuffs.", "blue-studio-blazer.jpg", ["Blazer", "Blue", "Dressy"], "#244d6f"),
  product(16, "navy-button-vest", "Navy Button Vest", "clothes", 20, "Fresh", "A navy vest with two tiny gold buttons and a neat tailored look.", "navy-button-vest.jpg", ["Vest", "Navy", "Buttons"], "#1d3a52"),
  product(17, "cocoa-button-vest", "Cocoa Button Vest", "clothes", 20, "Fresh", "A cocoa vest with warm tailoring for layered plush outfits.", "cocoa-button-vest.jpg", ["Vest", "Cocoa", "Buttons"], "#704f3d"),
  product(18, "olive-long-coat", "Olive Long Coat", "clothes", 26, "Fresh", "A long olive coat with cuff details for a cozy studio look.", "olive-long-coat.jpg", ["Coat", "Olive", "Layer"], "#463f33"),
  product(19, "sunny-button-coat", "Sunny Button Coat", "clothes", 26, "Fresh", "A bright yellow button coat with warm textured shading.", "sunny-button-coat.jpg", ["Coat", "Yellow", "Buttons"], "#ffbd32"),
  product(20, "cream-soft-cardigan", "Cream Soft Cardigan", "clothes", 24, "New", "A cream cardigan with long sleeves and one sweet front button.", "cream-soft-cardigan.jpg", ["Cardigan", "Cream", "Soft"], "#f5e3bd"),
  product(21, "pink-puff-sleeves", "Pink Puff Sleeves", "clothes", 18, "Tiny", "Pink puffy sleeves with soft ribbed cuffs for playful outfits.", "pink-puff-sleeves.jpg", ["Sleeves", "Pink", "Puffy"], "#efb5d7"),
  product(22, "cocoa-soft-cardigan", "Cocoa Soft Cardigan", "clothes", 24, "New", "A cocoa cardigan with gentle stitching and a cozy handmade feel.", "cocoa-soft-cardigan.jpg", ["Cardigan", "Cocoa", "Soft"], "#704d3c"),
  product(23, "rust-mini-tie", "Rust Mini Tie", "accessories", 8, "Tiny", "A tiny rust tie for polished plush portraits and gifting sets.", "rust-mini-tie.jpg", ["Tie", "Rust", "Mini"], "#b44d35"),
  product(24, "striped-cocoa-tie", "Striped Cocoa Tie", "accessories", 8, "Tiny", "A cocoa striped tie for a slightly fancy plush outfit.", "striped-cocoa-tie.jpg", ["Tie", "Striped", "Cocoa"], "#5b3528"),
  product(25, "blue-mini-tie", "Blue Mini Tie", "accessories", 8, "Tiny", "A tiny blue tie that adds a neat pop of color.", "blue-mini-tie.jpg", ["Tie", "Blue", "Mini"], "#4f70bc"),
  product(26, "white-ruffle-skirt", "White Ruffle Skirt", "clothes", 18, "Fresh", "A white ruffle skirt with soft folds and a delicate hem.", "white-ruffle-skirt.jpg", ["Skirt", "White", "Ruffle"], "#fbfbf7"),
  product(27, "blue-flower-dress", "Blue Flower Dress", "clothes", 24, "New", "A blue dress with a row of flower details along the hem.", "blue-flower-dress.jpg", ["Dress", "Blue", "Flowers"], "#5574b8"),
  product(28, "yellow-scallop-dress", "Yellow Scallop Dress", "clothes", 24, "New", "A sunny yellow dress with scalloped sleeves and hem.", "yellow-scallop-dress.jpg", ["Dress", "Yellow", "Scallop"], "#ffe276"),
  product(29, "cream-pocket-pinafore", "Cream Pocket Pinafore", "clothes", 22, "Fresh", "A cream pinafore with a small front pocket for tiny notes.", "cream-pocket-pinafore.jpg", ["Pinafore", "Cream", "Pocket"], "#ead8b9"),
  product(30, "white-soft-tee", "White Soft Tee (\"Your bra strap is showing!!\")", "clothes", 15, "New", "A clean white tee with a relaxed plush-friendly shape.", "white-soft-tee.jpg", ["Tee", "White", "Everyday"], "#f7f7f4"),
  product(31, "black-bell-sleeve-top", "Black Bell Sleeve Top", "clothes", 18, "Fresh", "A black top with long bell sleeves for a dramatic tiny outfit.", "black-bell-sleeve-top.jpg", ["Top", "Black", "Bell sleeves"], "#090909"),
  product(32, "pink-sleeveless-top", "Pink Sleeveless Top", "clothes", 15, "Fresh", "A soft pink sleeveless top for simple everyday layering.", "pink-sleeveless-top.jpg", ["Top", "Pink", "Sleeveless"], "#f7eef2"),
  product(33, "black-sleeveless-top", "Black Sleeveless Top", "clothes", 15, "Fresh", "A black sleeveless top with a clean tiny silhouette.", "black-sleeveless-top.jpg", ["Top", "Black", "Sleeveless"], "#080808"),
  product(34, "black-short-sleeve-tee", "Black Short Sleeve Tee", "clothes", 15, "Fresh", "A black short-sleeve tee for minimal plush outfits.", "black-short-sleeve-tee.jpg", ["Tee", "Black", "Everyday"], "#080808"),
  product(35, "white-short-sleeve-tee", "White Short Sleeve Tee", "clothes", 15, "Fresh", "A white short-sleeve tee with soft sketched seams.", "white-short-sleeve-tee.jpg", ["Tee", "White", "Everyday"], "#f8f8f5"),
  product(36, "black-stitch-hem-top", "Black Stitch Hem Top", "clothes", 18, "Fresh", "A black top with sweet white stitch details along the hem.", "black-stitch-hem-top.jpg", ["Top", "Black", "Stitched"], "#080808"),
  product(37, "rust-collar-shirt", "Rust Collar Shirt", "clothes", 20, "New", "A rust button-up shirt with a tiny collar and front buttons.", "rust-collar-shirt.jpg", ["Shirt", "Rust", "Collar"], "#a94834"),
  product(38, "pink-bow-blouse", "Pink Bow Blouse", "clothes", 20, "New", "A pink blouse with a soft bow and lace-like trim.", "pink-bow-blouse.jpg", ["Blouse", "Pink", "Bow"], "#efbfd7"),
  product(39, "taupe-collar-shirt", "Taupe Collar Shirt", "clothes", 20, "Fresh", "A taupe button-up shirt with simple everyday charm.", "taupe-collar-shirt.jpg", ["Shirt", "Taupe", "Collar"], "#a08370"),
  product(40, "cream-collar-shirt", "Cream Collar Shirt", "clothes", 20, "Fresh", "A cream button-up shirt with a tidy collar and soft lines.", "cream-collar-shirt.jpg", ["Shirt", "Cream", "Collar"], "#fff9e8"),
  product(41, "rust-pleated-skirt", "Rust Pleated Skirt", "clothes", 16, "Fresh", "A rust pleated skirt for warm everyday styling.", "rust-pleated-skirt.jpg", ["Skirt", "Rust", "Pleated"], "#a44735"),
  product(42, "black-pleated-skirt", "Black Pleated Skirt", "clothes", 16, "Fresh", "A black pleated skirt with a soft hand-drawn edge.", "black-pleated-skirt.jpg", ["Skirt", "Black", "Pleated"], "#0a0807"),
  product(43, "cream-pleated-skirt", "Cream Pleated Skirt", "clothes", 16, "Fresh", "A cream pleated skirt that pairs with almost any tiny top.", "cream-pleated-skirt.jpg", ["Skirt", "Cream", "Pleated"], "#fff8e9"),
  product(44, "cream-lace-hem-skirt", "Cream Lace Hem Skirt", "clothes", 18, "New", "A cream skirt with a soft lace-like scalloped hem.", "cream-lace-hem-skirt.jpg", ["Skirt", "Cream", "Lace hem"], "#fff8e8"),
  product(45, "rust-plaid-shorts", "Rust Plaid Shorts", "clothes", 18, "Fresh", "Rust plaid shorts with a cozy checked texture.", "rust-plaid-shorts.jpg", ["Shorts", "Plaid", "Rust"], "#9d4638"),
  product(46, "black-comfy-shorts", "Black Comfy Shorts", "clothes", 16, "Fresh", "Simple black shorts for easy mix-and-match styling.", "black-comfy-shorts.jpg", ["Shorts", "Black", "Everyday"], "#080808"),
];

export const featuredProduct = products[0];

export function findProduct(slug: string | undefined) {
  return products.find((item) => item.slug === slug) ?? featuredProduct;
}
