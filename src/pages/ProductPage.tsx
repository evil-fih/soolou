import { CheckCircle, Heart, ShoppingBag } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { DollPreview } from "../components/DollPreview";
import { ProductCard } from "../components/ProductCard";
import { findProduct, products } from "../data/products";

export function ProductPage({ slug }: { slug?: string }) {
  const product = findProduct(slug);
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <>
      <section className="section product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-media stitch-frame">
            <span className="product-badge">{product.badge}</span>
            <DollPreview look={product.look} label={product.name} size="lg" floating />
          </div>
          <div className="thumbnail-row" aria-label="Product previews">
            {[product, ...related.slice(0, 2)].map((item) => (
              <a href={`#/product/${item.slug}`} key={item.id} aria-label={item.name}>
                <DollPreview look={item.look} label={item.name} size="sm" />
              </a>
            ))}
          </div>
        </div>
        <div className="product-info-panel">
          <p className="product-type">{product.category}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="product-price-row">
            <strong>${product.price}</strong>
            <span>Made to order</span>
          </div>
          <div className="product-tags">
            {product.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="purchase-actions">
            <Button href="#/cart" size="lg" icon={<ShoppingBag weight="bold" />}>
              Buy
            </Button>
            <Button href="#/customize" variant="secondary" size="lg">
              Customize
            </Button>
            <a className="icon-button product-like" href="#/shop" aria-label="Save product">
              <Heart weight="bold" />
            </a>
          </div>
          <div className="detail-list">
            <div>
              <CheckCircle weight="fill" />
              <span>{product.detail}</span>
            </div>
            <div>
              <CheckCircle weight="fill" />
              <span>Ships with care card, soft wrap, and order updates.</span>
            </div>
            <div>
              <CheckCircle weight="fill" />
              <span>Optional name stitching can be added during checkout.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="related-heading">
        <div className="section-heading-row">
          <h2 id="related-heading">More tiny favorites</h2>
          <a className="filter-pill" href="#/shop">
            View all
          </a>
        </div>
        <div className="product-grid related-grid">
          {related.map((item) => (
            <ProductCard product={item} key={item.id} compact />
          ))}
        </div>
      </section>
    </>
  );
}
