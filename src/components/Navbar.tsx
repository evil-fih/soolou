import { useState } from "react";
import {
  Heart,
  List,
  PencilSimple,
  ShieldCheck,
  ShoppingCart,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";

const navLinks = [
  { label: "Home", href: "#/" },
  { label: "Shop", href: "#/shop" },
  { label: "About", href: "#/about" },
  { label: "Contact", href: "#/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, isStaff } = useAuth();
  const { itemCount } = useCart();
  const { favoriteCount } = useFavorites();
  const fullName = user?.user_metadata?.full_name;
  const accountLabel = user
    ? typeof fullName === "string" && fullName.trim()
      ? fullName.trim().split(" ")[0]
      : "Account"
    : "Sign in";
  const accountHref = user ? "#/profile" : "#/login";

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <BrandLogo />
        <div className="nav-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <Button href="#/customize" variant="white" size="sm" icon={<PencilSimple weight="bold" />}>
            Create
          </Button>
          <a className="icon-button icon-button-pink" href="#/favorites" aria-label="Favorites">
            <Heart weight="fill" />
            {favoriteCount > 0 ? <span className="favorite-count">{favoriteCount}</span> : null}
          </a>
          <a className="nav-account-link" href={accountHref} aria-label={user ? "My Account" : "Sign in"}>
            <UserCircle weight="bold" />
            <span>{loading ? "..." : accountLabel}</span>
          </a>
          {isStaff ? (
            <a className="icon-button" href="#/admin" aria-label="Admin">
              <ShieldCheck weight="bold" />
            </a>
          ) : null}
          <a className="icon-button" href="#/cart" aria-label="Cart">
            <ShoppingCart weight="bold" />
            {itemCount > 0 ? <span className="cart-count">{itemCount}</span> : null}
          </a>
        </div>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X weight="bold" /> : <List weight="bold" />}
        </button>
      </nav>
      {open ? (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#/customize" onClick={() => setOpen(false)}>
            Create a plush
          </a>
          <a href={accountHref} onClick={() => setOpen(false)}>
            {user ? "My Account" : "Log in"}
          </a>
          {isStaff ? (
            <a href="#/admin" onClick={() => setOpen(false)}>
              Admin
            </a>
          ) : null}
          <a href="#/favorites" onClick={() => setOpen(false)}>
            Favorites
          </a>
          <a href="#/cart" onClick={() => setOpen(false)}>
            Cart
          </a>
        </div>
      ) : null}
    </header>
  );
}
