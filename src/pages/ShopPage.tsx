import { useEffect, useMemo, useState } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { ProductCard } from "../components/ProductCard";
import { useProductCatalog } from "../context/ProductCatalogContext";
import { categories, type ProductCategory } from "../data/products";

const categoryHeadings: Record<ProductCategory | "all", string> = {
  all: "All products",
  clothes: "Clothes",
  hair: "Hairstyles",
  accessories: "Accessories",
  limited: "Limited Products",
};

const productsPerPage = 8;

export function ShopPage({ route }: { route: string }) {
  const params = new URLSearchParams(route.split("?")[1] ?? "");
  const initialCategory = (params.get("category") as ProductCategory | null) ?? "all";
  const [category, setCategory] = useState<ProductCategory | "all">(initialCategory);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { products, loading, error } = useProductCatalog();

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch =
        category === "all" || product.category === category || product.extraCategories?.includes(category);
      const queryMatch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.tags.some((tag) => tag.toLowerCase().includes(q));
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / productsPerPage));
  const pageProducts = visibleProducts.slice((page - 1) * productsPerPage, page * productsPerPage);

  useEffect(() => {
    setPage(1);
  }, [category, query]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  return (
    <>
      <section className="shop-hero section stitch-frame">
        <div>
          <h1>Shop the Collection</h1>
          <p>Outfits, hairstyles, accessories, and limited pieces for your plush.</p>
        </div>
        <div className="shop-search">
          <MagnifyingGlass weight="bold" />
          <label>
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find your next Soolou fit"
            />
          </label>
        </div>
      </section>
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
            <h2 id="shop-results-heading">{query.trim() ? `Results for "${query.trim()}"` : categoryHeadings[category]}</h2>
            <span>
              {visibleProducts.length} items · page {page} of {totalPages}
            </span>
          </div>
          {loading ? <p className="catalog-note">Loading the latest Soolou pieces...</p> : null}
          {error ? <p className="catalog-note">{error}</p> : null}
          {visibleProducts.length > 0 ? (
            <>
              <div className="product-grid shop-product-grid">
                {pageProducts.map((product) => (
                  <ProductCard product={product} key={product.id} showBadge />
                ))}
              </div>
              {totalPages > 1 ? (
                <nav className="shop-pagination" aria-label="Shop pages">
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      className={pageNumber === page ? "shop-page-button shop-page-button-active" : "shop-page-button"}
                      type="button"
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      aria-current={pageNumber === page ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </>
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
