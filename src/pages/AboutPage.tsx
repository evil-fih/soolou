import { Gift, Heart, Needle, Robot, Scissors, Sparkle } from "@phosphor-icons/react";
import { CTASection } from "../components/CTASection";

export function AboutPage() {
  return (
    <>
      <section className="about-hero section stitch-frame">
        <div>
          <h1>About Us</h1>
          <p>
            We make plushies that you can customize! T-shirts, skirts, anything is possible!
          </p>
        </div>
        <img src="/base-doll-nobg.png" alt="Soolou keepsake doll" className="about-hero-doll" style={{ marginRight: '5rem' }} />
      </section>
      <section className="section story-section">
        <div className="story-card">
          <h2>Made for the people you love</h2>
          <p>
            Most gifts are pretty generic and boring. Instead of cards and roses on Valentine's Day, why not Soolou?
          </p>
        </div>
        <div className="process-grid">
          <div>
            <Sparkle weight="fill" />
            <h3>Absolutely-super customizable</h3>
            <p>You can choose the hair and the outfit so it matches you or the person you are gifting this to.</p>
          </div>
          <div>
            <Scissors weight="fill" />
            <h3>Completely handmade</h3>
            <p>Everything (excluding the base plushie) is made by humans! Your AI slop bores me.</p>
          </div>
          <div>
            <Needle weight="fill" />
            <h3>The Giving Tree</h3>
            <p>You can add a name or a side note, we will deliver it straight to you or your loved ones.</p>
          </div>
          <div>
            <Robot weight="fill" />
            <h3>Emotional companion</h3>
            <p>Every plushie has a built-in AI that can speak through out "advanced technology"</p>
          </div>
          <div>
            <Gift weight="fill" />
            <h3>Built for gifting.</h3>
            <p>Choose a gift box, add a handwritten note, and it ships directly to them — no extra stops needed.</p>
          </div>
          <div>
            <Heart weight="fill" />
            <h3>Super duper durable</h3>
            <p>We use soft but durable materials because gifts shouldn't fall apart after 2 weeks!</p>
          </div>
        </div>
      </section>
      <CTASection
        className="cta-section--sm"
        title="Start building"
        text="Pick the details and we'll handle the rest!"
        actionLabel="Open Builder"
      />
    </>
  );
}
