import { FormEvent, useState } from "react";
import { CreditCard, Flask, LockKey, MapPin, Package, Truck } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { ProductThumbnail } from "../components/ProductThumbnail";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { canUseBackend, createOrder } from "../lib/backend";

const giftWrapFee = 6;

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const giftWrapTotal = items.length && giftWrap ? giftWrapFee : 0;
  const total = items.length ? subtotal + giftWrapTotal : 0;
  const fullName = user?.user_metadata?.full_name;
  const defaultName = typeof fullName === "string" ? fullName : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;

    if (!user) {
      setError("Log in before placing your order.");
      return;
    }

    if (!canUseBackend()) {
      setError("Supabase is not configured yet, so Soolou cannot save this order.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    setError("");
    setPlacing(true);

    try {
      const newOrderId = await createOrder({
        userId: user?.id,
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        deliveryNotes: String(formData.get("deliveryNotes") ?? ""),
        giftWrap,
        giftWrapFee: giftWrapTotal,
        subtotal,
        total,
        items,
      });

      window.location.hash = `/payment-test?order=${encodeURIComponent(newOrderId)}&total=${encodeURIComponent(total.toFixed(2))}`;
    } catch (orderError) {
      setError(
        orderError instanceof Error
          ? orderError.message
          : "Could not place your order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  }

  if (!user) {
    return (
      <section className="section checkout-success-page" aria-labelledby="checkout-login-heading">
        <div className="checkout-success-card stitch-frame">
          <LockKey weight="fill" />
          <h1 id="checkout-login-heading">Log in to checkout</h1>
          <p>Your cart is saved on this browser. Log in and your items will stay with you.</p>
          <Button href="#/login?checkout=1&redirect=%2Fcheckout" size="lg">
            Log in
          </Button>
          <Button href="#/cart" variant="secondary" size="lg">
            Back to cart
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section checkout-layout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-heading">
          <span className="auth-kicker">Sandbox Checkout</span>
          <h1>Checkout</h1>
          <p>Enter shipping details and continue to a test payment. No real money will move.</p>
        </div>

        <fieldset className="checkout-fieldset">
          <legend>
            <MapPin weight="bold" />
            Shipping Details
          </legend>
          <div className="checkout-field-grid">
            <label className="field-group">
              <span>Full name</span>
              <input name="fullName" required autoComplete="name" placeholder="Your name" defaultValue={defaultName} />
            </label>
            <label className="field-group">
              <span>Email</span>
              <input name="email" required autoComplete="email" type="email" placeholder="you@example.com" defaultValue={user?.email ?? ""} />
            </label>
            <label className="field-group checkout-field-full">
              <span>Address</span>
              <input name="address" required autoComplete="street-address" placeholder="Street address" />
            </label>
            <label className="field-group">
              <span>City</span>
              <input name="city" required autoComplete="address-level2" placeholder="City" />
            </label>
            <label className="field-group">
              <span>Postal code</span>
              <input name="postalCode" required autoComplete="postal-code" placeholder="Postal code" />
            </label>
          </div>
        </fieldset>

        <fieldset className="checkout-fieldset">
          <legend>
            <Truck weight="bold" />
            Delivery Notes
          </legend>
          <label className="field-group">
            <span>Gift note or delivery instructions</span>
            <textarea name="deliveryNotes" placeholder="Optional note for gift timing, name stitching, or delivery details" />
          </label>
          <label className="gift-wrap-option">
            <input
              type="checkbox"
              checked={giftWrap}
              disabled={!items.length}
              onChange={(event) => setGiftWrap(event.target.checked)}
            />
            <span>
              <strong>Add gift wrap</strong>
              <small>Soft wrap and a Soolou note card</small>
            </span>
            <b>${giftWrapFee}</b>
          </label>
        </fieldset>

        <fieldset className="checkout-fieldset">
          <legend>
            <CreditCard weight="bold" />
            Payment
          </legend>
          <div className="payment-placeholder">
            <Flask weight="bold" />
            <div>
              <strong>Sandbox payment</strong>
              <p>You will use a test card on the next screen. No real card details are accepted.</p>
            </div>
          </div>
        </fieldset>

        {error ? <p className="error-message">{error}</p> : null}

        <button className="button button-primary button-lg" type="submit" disabled={!items.length || placing}>
          <LockKey weight="bold" />
          {placing ? "Creating Test Order..." : "Continue to Test Payment"}
        </button>
      </form>

      <aside className="order-summary checkout-summary stitch-frame">
        <h2>Order summary</h2>
        {items.length ? (
          <div className="checkout-item-list">
            {items.map((item) => (
              <div className="checkout-item" key={item.product.id}>
                <ProductThumbnail product={item.product} size="sm" />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>Qty {item.quantity}</span>
                </div>
                <b>${item.product.price * item.quantity}</b>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state checkout-empty-state">
            <Package weight="bold" />
            <h3>Your cart is empty</h3>
            <p>Add a plush before checking out.</p>
            <Button href="#/shop">Shop Plush</Button>
          </div>
        )}
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>${subtotal}</strong>
        </div>
        <div className="summary-row">
          <span>Gift wrap</span>
          <strong>${giftWrapTotal}</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>Calculated later</strong>
        </div>
        <div className="summary-total">
          <span>Test total</span>
          <strong>${total}</strong>
        </div>
      </aside>
    </section>
  );
}
