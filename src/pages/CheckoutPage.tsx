import { FormEvent, useState } from "react";
import { ChatCircle, Envelope } from "@phosphor-icons/react";
import { Button } from "../components/Button";

export function CheckoutPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="section checkout-layout">
      <div className="checkout-copy stitch-frame">
        <h1>Checkout and contact</h1>
        <p>
          Send your order details, custom notes, and shipping preferences. Soolou will confirm the
          final make time before payment.
        </p>
        <div className="contact-cards">
          <a href="mailto:hello@soolou.example">
            <Envelope weight="bold" />
            hello@soolou.example
          </a>
          <a href="#/checkout">
            <ChatCircle weight="bold" />
            Chat with Soolou
          </a>
        </div>
      </div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Name</span>
          <input required placeholder="Your name" />
        </label>
        <label className="field-group">
          <span>Email</span>
          <input required type="email" placeholder="you@example.com" />
        </label>
        <label className="field-group">
          <span>Order type</span>
          <select defaultValue="custom">
            <option value="custom">Custom plush</option>
            <option value="gift">Gift-ready doll</option>
            <option value="shop">Shop item order</option>
          </select>
        </label>
        <label className="field-group">
          <span>Message</span>
          <textarea placeholder="Tell us colors, names, sizes, or gift timing" />
        </label>
        <Button type="submit" size="lg">
          Send Order
        </Button>
        {sent ? (
          <p className="success-message" role="status">
            Thanks. Your Soolou order note is ready for studio review.
          </p>
        ) : null}
      </form>
    </section>
  );
}
