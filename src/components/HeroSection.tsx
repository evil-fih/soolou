import { Gift, ShieldCheck } from "@phosphor-icons/react";
import { featuredProduct } from "../data/products";
import { Button } from "./Button";
import { DollPreview } from "./DollPreview";

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="hero-kicker">Custom plush dolls and tiny outfits</p>
        <h1>Design Your Plush</h1>
        <p className="hero-subtitle">
          Pick the face, outfit, hair, and note. Soolou turns it into a soft gift.
        </p>
        <div className="hero-actions">
          <Button href="#/customize" size="lg">
            Design My Plush
          </Button>
          <Button href="#/shop" variant="secondary" size="lg">
            Shop Drops
          </Button>
        </div>
      </div>
      <div className="hero-visual stitch-frame">
        <div className="hero-banner-copy">
          <span>Fresh drop</span>
          <strong>{featuredProduct.name}</strong>
        </div>
        <DollPreview look={featuredProduct.look} label={featuredProduct.name} size="lg" floating />
        <div className="hero-trust-card">
          <span>
            <ShieldCheck weight="fill" />
            Handmade finish
          </span>
          <span>
            <Gift weight="fill" />
            Gift ready
          </span>
        </div>
      </div>
    </section>
  );
}
