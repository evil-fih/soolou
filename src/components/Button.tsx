import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  icon,
  className = "",
  onClick,
  ariaLabel,
}: ButtonProps) {
  const classes = ["button", `button-${variant}`, `button-${size}`, className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon ? <span className="button-icon">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
