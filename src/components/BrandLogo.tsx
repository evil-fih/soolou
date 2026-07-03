export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <a className={compact ? "brand-logo brand-logo-compact" : "brand-logo"} href="#/">
      <span>Sool</span>
      <span className="brand-logo-mark" aria-hidden="true">
        <span />
      </span>
      <span>u</span>
    </a>
  );
}
