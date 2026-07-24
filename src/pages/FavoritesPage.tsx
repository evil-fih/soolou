import { Heart } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { useFavorites } from "../context/FavoritesContext";

export function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <section className="section favorites-page" aria-labelledby="favorites-heading">
      <div className="section-heading-row">
        <h1 id="favorites-heading">Your favorites</h1>
        <a className="filter-pill" href="#/shop">
          Shop more
        </a>
      </div>

      {favorites.length ? (
        <div className="product-grid">
          {favorites.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state stitch-frame favorites-empty">
          <Heart weight="fill" />
          <h2>No favorites yet</h2>
          <p>Tap the heart on any product to save it here.</p>
          <Button href="#/shop">Browse</Button>
        </div>
      )}
    </section>
  );
}
