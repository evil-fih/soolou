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
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
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
          <a href="#/shop">Shop</a>
          <a href="#/contact">Contact</a>
          <a href="#/privacy">Privacy Policy</a>
        </div>
        <div className="footer-social">
          <a href="mailto:soolouofficial@gmail.com" aria-label="Email Soolou">
            <Envelope weight="bold" />
            soolouofficial@gmail.com
          </a>
          <div className="social-row">
            <a href="https://www.tiktok.com/@soolouofficial?lang=en" aria-label="Soolou on TikTok" target="_blank" rel="noreferrer">
              <TiktokLogo weight="fill" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61591799177046&locale=vi_VN" aria-label="Soolou on Facebook" target="_blank" rel="noreferrer">
              <FacebookLogo weight="fill" />
            </a>
            <a href="https://www.instagram.com/soolouofficial/" aria-label="Soolou on Instagram" target="_blank" rel="noreferrer">
              <InstagramLogo weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
