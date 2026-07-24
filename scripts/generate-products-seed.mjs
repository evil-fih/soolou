import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const productsPath = join(rootDir, "src", "data", "products.ts");
const outputPath = join(rootDir, "supabase", "migrations", "202607041_seed_products.sql");
const source = readFileSync(productsPath, "utf8");

const productsMatch = source.match(/export const products: Product\[\] = \[([\s\S]*?)\];/);

if (!productsMatch) {
  throw new Error("Could not find products array.");
}

const fallbackLook = {
  body: "#f9d8c9",
  belly: "#fff6ef",
  hair: "#4c3f4e",
  outfit: "#7dc7ed",
  accent: "#ff78ae",
  expression: "smile",
};

function product(
  id,
  slug,
  name,
  category,
  price,
  badge,
  description,
  image,
  tags,
  palette,
  extraCategories = [],
) {
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

const products = vm.runInNewContext(`[${productsMatch[1]}]`, { product });
products.push({
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
  extraCategories: [],
  image: "/base-doll-nobg.png",
  look: {
    body: "#f5dcb8",
    belly: "#fff3df",
    hair: "#2c2230",
    outfit: "#f5dcb8",
    accent: "#e375ad",
    expression: "smile",
  },
});

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlTextArray(values) {
  if (!values?.length) return "array[]::text[]";
  return `array[${values.map(sqlString).join(", ")}]`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

const rows = products.map((item) => `  (
    ${item.id},
    ${sqlString(item.slug)},
    ${sqlString(item.name)},
    ${sqlString(item.category)},
    ${item.price},
    ${sqlString(item.badge)},
    ${sqlString(item.description)},
    ${sqlString(item.detail)},
    ${sqlTextArray(item.tags)},
    ${sqlString(item.palette)},
    ${sqlTextArray(item.extraCategories)},
    ${sqlString(item.image)},
    ${sqlJson(item.look)},
    true
  )`);

const sql = `insert into public.products (
  id,
  slug,
  name,
  category,
  price,
  badge,
  description,
  detail,
  tags,
  palette,
  extra_categories,
  image,
  look,
  active
)
values
${rows.join(",\n")}
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  badge = excluded.badge,
  description = excluded.description,
  detail = excluded.detail,
  tags = excluded.tags,
  palette = excluded.palette,
  extra_categories = excluded.extra_categories,
  image = excluded.image,
  look = excluded.look,
  active = excluded.active,
  updated_at = now();
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql);
console.log(`wrote ${products.length} products to ${outputPath}`);
