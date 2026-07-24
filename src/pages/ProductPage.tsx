import { CheckCircle, Heart, ShoppingCart } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { ProductModel } from "../components/ProductModel";
import { NotFoundPage } from "./NotFoundPage";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useProductCatalog } from "../context/ProductCatalogContext";

export function ProductPage({ slug }: { slug?: string }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { findProduct, products } = useProductCatalog();
  const product = findProduct(slug);
  if (!product) return <NotFoundPage />;

  const saved = isFavorite(product.id);
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <>
      <section className="section product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-media stitch-frame">
            <ProductModel product={product} size="large" />
          </div>
          <div className="thumbnail-row" aria-label="Product previews">
            {[product, ...related.slice(0, 2)].map((item) => (
              <a href={`#/product/${item.slug}`} key={item.id} aria-label={item.name}>
                <ProductModel product={item} size="thumb" />
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
            <button
              className="button button-primary button-lg"
              type="button"
              onClick={() => addItem(product)}
            >
              <span className="button-icon">
                <ShoppingCart weight="bold" />
              </span>
              <span>Add to cart</span>
            </button>
            <Button href="#/customize" variant="secondary" size="lg">
              Customize
            </Button>
            <button
              className={saved ? "icon-button product-like product-card-favorite-active" : "icon-button product-like"}
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-label={saved ? `Remove ${product.name} from favorites` : `Save ${product.name}`}
              aria-pressed={saved}
            >
              <Heart weight={saved ? "fill" : "bold"} />
            </button>
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
