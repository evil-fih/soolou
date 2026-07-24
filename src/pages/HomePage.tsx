import { FunnelSimple } from "@phosphor-icons/react";
import { CTASection } from "../components/CTASection";
import { HeroSection } from "../components/HeroSection";
import { ProductCard } from "../components/ProductCard";
import { TrustBadges } from "../components/TrustBadges";
import { useProductCatalog } from "../context/ProductCatalogContext";

const featuredSlugs = [
  "cocoa-patch-shorts",
  "midnight-tousle-hair",
  "moss-patch-shorts",
  "white-soft-tee",
];

export function HomePage() {
  const { products } = useProductCatalog();
  const featuredProducts = featuredSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  return (
    <>
      <HeroSection />
      <section className="section product-section" aria-labelledby="fresh-stitches-heading">
        <div className="section-heading-row">
          <h2 id="fresh-stitches-heading">New Stuff</h2>
          <a className="filter-pill" href="#/shop">
            <FunnelSimple weight="bold" />
            Filter
          </a>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard product={product!} key={product!.id} showBadge />
          ))}
        </div>

      </section>
      <CTASection />
      <TrustBadges />
    </>
  );
}
