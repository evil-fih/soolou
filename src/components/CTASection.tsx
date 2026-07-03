import { Button } from "./Button";

interface CTASectionProps {
  title?: string;
  text?: string;
  actionLabel?: string;
  href?: string;
}

export function CTASection({
  title = "Design My Plush",
  text = "A plush, uniquely you.",
  actionLabel = "Start Creating",
  href = "#/customize",
}: CTASectionProps) {
  return (
    <section className="cta-section stitch-frame">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Button href={href} size="lg">
        {actionLabel}
      </Button>
    </section>
  );
}
