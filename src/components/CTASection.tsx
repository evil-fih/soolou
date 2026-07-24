import { Button } from "./Button";

interface CTASectionProps {
  title?: string;
  text?: string;
  actionLabel?: string;
  href?: string;
  className?: string;
}

export function CTASection({
  title = "Design My Plush",
  text = "A plush, uniquely you.",
  actionLabel = "Start Creating",
  href = "#/customize",
  className = "",
}: CTASectionProps) {
  return (
    <section className={`cta-section stitch-frame${className ? ` ${className}` : ""}`}>
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
