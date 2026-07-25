import { Gift, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "./Button";

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="hero-kicker">Customizable plushies</p>
        <h1>Design Your Own Plush!</h1>
        <p className="hero-subtitle">
          Choose the outfit, we do the rest.
        </p>
        <div className="hero-actions">
          <Button href="#/customize" size="lg">
            Design My Plush
          </Button>
          <Button href="#/shop" variant="secondary" size="lg">
            Browse
          </Button>
        </div>
      </div>
      <div className="hero-visual stitch-frame">
        <div className="hero-banner-copy">
          <span>New Stuff</span>
          <strong>Blue Denim Shorts</strong>
        </div>
        <img
          src="/advertised-doll.png"
          alt="Soolou plush doll"
          className="hero-doll-img"
        />
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
