import type { CSSProperties } from "react";
import type { DollLook } from "../data/products";

interface DollPreviewProps {
  look: DollLook;
  label: string;
  size?: "sm" | "md" | "lg";
  floating?: boolean;
}

export function DollPreview({ look, label, size = "md", floating = false }: DollPreviewProps) {
  const style = {
    "--doll-body": look.body,
    "--doll-belly": look.belly,
    "--doll-hair": look.hair,
    "--doll-outfit": look.outfit,
    "--doll-accent": look.accent,
  } as CSSProperties;

  return (
    <div
      className={`doll-preview doll-${size}${floating ? " doll-floating" : ""}`}
      style={style}
      role="img"
      aria-label={label}
    >
      <div className="doll-shadow" />
      <div className="doll-ears">
        <span />
        <span />
      </div>
      <div className="doll-body">
        <div className="doll-hair" />
        <div className="doll-face">
          <span className={`doll-eye doll-eye-left doll-eye-${look.expression}`} />
          <span className={`doll-eye doll-eye-right doll-eye-${look.expression}`} />
          <span className={`doll-mouth doll-mouth-${look.expression}`} />
          <span className="doll-cheek doll-cheek-left" />
          <span className="doll-cheek doll-cheek-right" />
        </div>
        <div className="doll-belly" />
        <div className="doll-outfit" />
        <div className="doll-bow" />
      </div>
      <div className="doll-feet">
        <span />
        <span />
      </div>
    </div>
  );
}
