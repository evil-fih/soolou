import { Gift, Heart, Needle, Robot, Scissors, Sparkle } from "@phosphor-icons/react";
import { CTASection } from "../components/CTASection";

export function AboutPage() {
  return (
    <>
      <section className="about-hero section stitch-frame">
        <div>
          <h1>About Soolou</h1>
          <p>
            We make custom plushs you can dress, style, and give as gifts — built around the
            person you have in mind.
          </p>
        </div>
        <img src="/base-doll-nobg.png" alt="Soolou keepsake doll" className="about-hero-doll" style={{ marginRight: '5rem' }} />
      </section>
      <section className="section story-section">
        <div className="story-card">
          <h2>Made for the people you love.</h2>
          <p>
            Most gifts are generic. Soolou plushs aren't. You pick the hair, the outfit, the little
            details — and we put it all together into something the other person will actually want
            to keep.
          </p>
        </div>
        <div className="process-grid">
          <div>
            <Sparkle weight="fill" />
            <h3>You design it</h3>
            <p>Choose the hair, colors, and outfit that fit the person you're making it for.</p>
          </div>
          <div>
            <Scissors weight="fill" />
            <h3>We make it</h3>
            <p>Every plush is stitched with care — soft fabrics, clean finishes, no shortcuts.</p>
          </div>
          <div>
            <Needle weight="fill" />
            <h3>Ready to give</h3>
            <p>Add a name or gift note and it ships ready to hand over.</p>
          </div>
          <div>
            <Robot weight="fill" />
            <h3>Your plush can talk.</h3>
            <p>Every plush has a built-in AI that you can have a real voice conversation with.</p>
          </div>
          <div>
            <Gift weight="fill" />
            <h3>Built for gifting.</h3>
            <p>Choose a gift box, add a handwritten note, and it ships directly to them — no extra stops needed.</p>
          </div>
          <div>
            <Heart weight="fill" />
            <h3>Made to last.</h3>
            <p>We use soft, durable materials that hold up over time — because a good gift shouldn't fall apart after a week.</p>
          </div>
        </div>
      </section>
      <CTASection
        className="cta-section--sm"
        title="Build your plush"
        text="Pick the details and we'll handle the rest."
        actionLabel="Open Builder"
      />
    </>
  );
}
