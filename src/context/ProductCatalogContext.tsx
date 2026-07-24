import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { basePlushProduct, normalizeBasePlushProduct } from "../data/basePlush";
import {
  products as fallbackProducts,
  type DollExpression,
  type DollLook,
  type Product,
  type ProductCategory,
} from "../data/products";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number | string;
  badge: string | null;
  description: string | null;
  detail: string | null;
  tags: string[] | null;
  palette: string | null;
  extra_categories: string[] | null;
  image: string | null;
  look: Partial<DollLook> | null;
};

interface ProductCatalogValue {
  products: Product[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  findProduct: (slug: string | undefined) => Product | undefined;
  findProductByIdOrSlug: (product: Product) => Product | undefined;
}

const ProductCatalogContext = createContext<ProductCatalogValue | undefined>(undefined);

const validCategories = new Set<ProductCategory>(["clothes", "hair", "accessories", "limited"]);
const validExpressions = new Set<DollExpression>(["smile", "button", "sleepy", "spark"]);
const fallbackCatalog = normalizeProducts([...fallbackProducts, basePlushProduct]);

function fallbackLookFor(row: ProductRow): DollLook {
  const palette = row.palette || "#7dc7ed";

  return {
    body: "#f9d8c9",
    belly: "#fff6ef",
    hair: row.category === "hair" ? palette : "#4c3f4e",
    outfit: palette,
    accent: palette,
    expression: row.category === "accessories" ? "spark" : "smile",
  };
}

function normalizeCategory(category: string): ProductCategory {
  return validCategories.has(category as ProductCategory) ? (category as ProductCategory) : "clothes";
}

function normalizeExpression(expression: unknown): DollExpression {
  return validExpressions.has(expression as DollExpression) ? (expression as DollExpression) : "smile";
}

function normalizeLook(row: ProductRow): DollLook {
  const fallback = fallbackLookFor(row);
  const look = row.look ?? {};

  return {
    body: typeof look.body === "string" ? look.body : fallback.body,
    belly: typeof look.belly === "string" ? look.belly : fallback.belly,
    hair: typeof look.hair === "string" ? look.hair : fallback.hair,
    outfit: typeof look.outfit === "string" ? look.outfit : fallback.outfit,
    accent: typeof look.accent === "string" ? look.accent : fallback.accent,
    expression: normalizeExpression(look.expression),
  };
}

function mapProductRow(row: ProductRow): Product {
  const category = normalizeCategory(row.category);
  const extraCategories = (row.extra_categories ?? []).filter((item): item is ProductCategory =>
    validCategories.has(item as ProductCategory),
  );

  return normalizeBasePlushProduct({
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category,
    price: Number(row.price) || 0,
    badge: row.badge ?? "Fresh",
    description: row.description ?? "",
    detail: row.detail ?? "Hand-drawn Soolou piece made for mix-and-match plush styling.",
    tags: row.tags ?? [],
    palette: row.palette ?? "#7dc7ed",
    extraCategories,
    image: row.image ?? undefined,
    look: normalizeLook(row),
  });
}

function normalizeProducts(items: Product[]): Product[] {
  const seen = new Map<number, Product>();

  items.map(normalizeBasePlushProduct).forEach((product) => {
    seen.set(product.id, product);
  });

  return Array.from(seen.values()).sort((a, b) => a.id - b.id);
}

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackCatalog);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    const client = supabase;

    if (!client) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: productError } = await client
      .from("products")
      .select(
        "id, slug, name, category, price, badge, description, detail, tags, palette, extra_categories, image, look",
      )
      .eq("active", true)
      .order("id", { ascending: true });

    if (productError) {
      console.error("Could not load Soolou products", productError);
      setCatalogProducts(fallbackCatalog);
      setError("products could not load from supabase so local products are showing");
      setLoading(false);
      return;
    }

    const remoteProducts = (data ?? []).map((row) => mapProductRow(row as ProductRow));
    setCatalogProducts(remoteProducts.length > 0 ? normalizeProducts(remoteProducts) : fallbackCatalog);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    refreshProducts().catch((loadError) => {
      if (!mounted) return;
      console.error("Could not load Soolou products", loadError);
      setCatalogProducts(fallbackCatalog);
      setError("products could not load from supabase so local products are showing");
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [refreshProducts]);

  const value = useMemo<ProductCatalogValue>(() => {
    const publicProducts = catalogProducts.filter((product) => product.id !== basePlushProduct.id);
    return {
      products: publicProducts,
      allProducts: catalogProducts,
      loading,
      error,
      refreshProducts,
      findProduct: (slug) => publicProducts.find((product) => product.slug === slug),
      findProductByIdOrSlug: (product) =>
        catalogProducts.find((item) => item.id === product.id || item.slug === product.slug),
    };
  }, [catalogProducts, error, loading, refreshProducts]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);

  if (!context) {
    throw new Error("useProductCatalog must be used inside ProductCatalogProvider.");
  }

  return context;
}
