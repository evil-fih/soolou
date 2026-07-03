import { Gift, Palette, Scissors, Sparkle } from "@phosphor-icons/react";
import { categories } from "../data/products";
import type { ProductCategory } from "../data/products";

const iconMap = {
  clothes: Scissors,
  hair: Sparkle,
  accessories: Palette,
  limited: Gift,
} satisfies Record<ProductCategory, typeof Sparkle>;

export function CategoryStrip({ active }: { active?: ProductCategory | "all" }) {
  return (
    <section className="section category-section" aria-labelledby="categories-heading">
      <div className="section-heading-row">
        <h2 id="categories-heading">Shop by Category</h2>
        <a className="filter-pill" href="#/shop">
          View all
        </a>
      </div>
      <div className="category-grid">
        {categories.map((category) => {
          const Icon = iconMap[category.id];
          return (
            <a
              className={`category-card${active === category.id ? " category-card-active" : ""}`}
              key={category.id}
              href={`#/shop?category=${category.id}`}
            >
              <span className="category-art">
                <Icon weight="bold" />
              </span>
              <span>{category.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
