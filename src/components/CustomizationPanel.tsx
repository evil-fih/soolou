import { useMemo } from "react";
import type { Product } from "../data/products";
import { getWearableProducts, hairOptions, slotGroups } from "../data/wearables";

interface CustomizationPanelProps {
  products: Product[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
}

interface IconItem {
  slug: string;
  name: string;
  image: string;
}

const hairstyleItems: IconItem[] = hairOptions.map((h) => ({
  slug: h.slug,
  name: h.name,
  image: h.image,
}));

export function CustomizationPanel({ products, selectedSlugs, onToggle }: CustomizationPanelProps) {
  const sections = useMemo(() => {
    const wearableProducts = getWearableProducts(products);
    const topItems: IconItem[] = wearableProducts
      .filter((p) => slotGroups.top.includes(p.slug) || slotGroups.dress.includes(p.slug))
      .map((p) => ({ slug: p.slug, name: p.name, image: p.image ?? "" }));

    const bottomItems: IconItem[] = wearableProducts
      .filter((p) => slotGroups.bottom.includes(p.slug))
      .map((p) => ({ slug: p.slug, name: p.name, image: p.image ?? "" }));

    const accessoryItems: IconItem[] = wearableProducts
      .filter(
        (p) =>
          slotGroups.scarf.includes(p.slug) ||
          slotGroups.tie.includes(p.slug) ||
          slotGroups.hat.includes(p.slug) ||
          slotGroups.clip.includes(p.slug),
      )
      .map((p) => ({ slug: p.slug, name: p.name, image: p.image ?? "" }));

    return [
      { label: "Tops", items: topItems },
      { label: "Bottoms", items: bottomItems },
      { label: "Hairstyles", items: hairstyleItems },
      { label: "Accessories", items: accessoryItems },
    ];
  }, [products]);

  return (
    <div className="customization-panel">
      {sections.map(({ label, items }) => (
        <div key={label} className="option-group">
          <h3>{label}</h3>
          <div className="option-row option-row--icons">
            {items.map((item) => {
              const active = selectedSlugs.includes(item.slug);
              return (
                <button
                  key={item.slug}
                  type="button"
                  className={active ? "product-icon-btn product-icon-btn--active" : "product-icon-btn"}
                  onClick={() => onToggle(item.slug)}
                  title={item.name}
                  aria-label={item.name}
                  aria-pressed={active}
                >
                  <img src={item.image} alt={item.name} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
