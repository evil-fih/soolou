import { Needle, Scissors, Sparkle } from "@phosphor-icons/react";
import { CTASection } from "../components/CTASection";
import { DollPreview } from "../components/DollPreview";
import { products } from "../data/products";

export function AboutPage() {
  return (
    <>
      <section className="about-hero section stitch-frame">
        <div>
          <h1>About Us</h1>
          <p>
            Soolou makes plush keepsakes with playful details, soft colors, and a little bit of
            personal magic.
          </p>
        </div>
        <DollPreview look={products[7].look} label="Soolou keepsake doll" size="lg" floating />
      </section>
      <section className="section story-section">
        <div className="story-card">
          <h2>Made for the people you love.</h2>
          <p>
            The sketches point to a cheerful shop with room for custom dolls, outfits, gifts, and a
            friendly community. This page gives that idea a real brand story while keeping the same
            soft Soolou tone.
          </p>
        </div>
        <div className="process-grid">
          <div>
            <Sparkle weight="fill" />
            <h3>Choose the feeling</h3>
            <p>Pick colors, face details, hair, and small accessories that match the person.</p>
          </div>
          <div>
            <Scissors weight="fill" />
            <h3>We stitch it carefully</h3>
            <p>Each piece is finished with soft fabrics, tidy seams, and a final check.</p>
          </div>
          <div>
            <Needle weight="fill" />
            <h3>Wrap it sweetly</h3>
            <p>Add a name, gift note, or tiny charm so the plush feels ready to give.</p>
          </div>
        </div>
      </section>
      <CTASection
        title="Create a Soolou gift"
        text="Start with a plush idea and make it personal."
        actionLabel="Open Builder"
      />
    </>
  );
}
