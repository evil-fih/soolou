import {
  Envelope,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-clouds" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <BrandLogo compact />
          <p>Made for the people you love.</p>
          <p>Design a plush that is uniquely yours, or create one for someone special.</p>
        </div>
        <div className="footer-links">
          <a href="#/about">About Us</a>
          <a href="#/shop">Shop Giftably</a>
          <a href="#/checkout">Contact</a>
          <a href="#/checkout">Privacy Policy</a>
        </div>
        <div className="footer-social">
          <a href="mailto:hello@soolou.example" aria-label="Email Soolou">
            <Envelope weight="bold" />
            hello@soolou.example
          </a>
          <div className="social-row">
            <a href="#/checkout" aria-label="Soolou on TikTok">
              <TiktokLogo weight="fill" />
            </a>
            <a href="#/checkout" aria-label="Soolou on Facebook">
              <FacebookLogo weight="fill" />
            </a>
            <a href="#/checkout" aria-label="Soolou on Instagram">
              <InstagramLogo weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
