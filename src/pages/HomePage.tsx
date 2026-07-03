import { FunnelSimple } from "@phosphor-icons/react";
import { CategoryStrip } from "../components/CategoryStrip";
import { CTASection } from "../components/CTASection";
import { HeroSection } from "../components/HeroSection";
import { ProductCard } from "../components/ProductCard";
import { TrustBadges } from "../components/TrustBadges";
import { products } from "../data/products";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <section className="section product-section" aria-labelledby="fresh-stitches-heading">
        <div className="section-heading-row">
          <h2 id="fresh-stitches-heading">Fresh Stitches</h2>
          <a className="filter-pill" href="#/shop">
            <FunnelSimple weight="bold" />
            Filter
          </a>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <div className="pagination-dots" aria-label="Product pages">
          <a href="#/shop" aria-label="Page 1">
            1
          </a>
          <a href="#/shop" aria-label="Page 2">
            2
          </a>
          <a href="#/shop" aria-label="Page 3">
            3
          </a>
        </div>
      </section>
      <CTASection />
      <TrustBadges />
    </>
  );
}
