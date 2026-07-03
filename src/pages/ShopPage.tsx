import { useMemo, useState } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { CategoryStrip } from "../components/CategoryStrip";
import { ProductCard } from "../components/ProductCard";
import { categories, products, type ProductCategory } from "../data/products";

export function ShopPage({ route }: { route: string }) {
  const params = new URLSearchParams(route.split("?")[1] ?? "");
  const initialCategory = (params.get("category") as ProductCategory | null) ?? "all";
  const [category, setCategory] = useState<ProductCategory | "all">(initialCategory);
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = category === "all" || product.category === category;
      const queryMatch =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  return (
    <>
      <section className="shop-hero section stitch-frame">
        <div>
          <h1>Shop Soolou drops</h1>
          <p>Browse outfits, hair kits, accessories, and small-batch plush friends.</p>
        </div>
        <div className="shop-search">
          <MagnifyingGlass weight="bold" />
          <label>
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search outfits, curls, gifts"
            />
          </label>
        </div>
      </section>
      <CategoryStrip active={category} />
      <section className="section shop-layout" aria-labelledby="shop-results-heading">
        <aside className="filter-panel">
          <div className="filter-panel-title">
            <FunnelSimple weight="bold" />
            Filter
          </div>
          <div className="filter-stack">
            <button
              className={category === "all" ? "chip chip-active" : "chip"}
              type="button"
              onClick={() => setCategory("all")}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                className={category === item.id ? "chip chip-active" : "chip"}
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="filter-note">
            <strong>Need a custom idea?</strong>
            <p>Start with the builder and send us the details at checkout.</p>
          </div>
        </aside>
        <div>
          <div className="section-heading-row shop-results-heading">
            <h2 id="shop-results-heading">Newest plush pieces</h2>
            <span>{visibleProducts.length} items</span>
          </div>
          {visibleProducts.length > 0 ? (
            <div className="product-grid shop-product-grid">
              {visibleProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state stitch-frame">
              <h3>No stitches found</h3>
              <p>Try a different word or clear the category filter.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
